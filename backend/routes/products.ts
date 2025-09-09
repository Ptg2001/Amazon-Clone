// @ts-nocheck
export {};
const express = require('express');
const { body, query } = require('express-validator');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { handleValidationErrors, isValidObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, and pagination
// @access  Public
router.get('/', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .customSanitizer((val: string) => (val === '-discount' ? 'popular' : val))
    .isIn(['price_asc', 'price_desc', 'rating', 'newest', 'popular'])
    .withMessage('Invalid sort option'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number')
], handleValidationErrors, optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      sort = 'newest',
      featured,
      suggest
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    // Search filter
    if (search) {
      if (suggest === 'true') {
        // Partial match for live suggestions
        const regex = new RegExp(search, 'i');
        filter.$or = [
          { title: { $regex: regex } },
          { brand: { $regex: regex } },
          { tags: { $elemMatch: { $regex: regex } } }
        ];
      } else {
        filter.$text = { $search: search };
      }
    }

    // Category filter
    if (category) {
      if (isValidObjectId(category)) {
        filter.category = category;
      } else {
        // Search by category slug
        const categoryDoc = await Category.findOne({ slug: category });
        if (categoryDoc) {
          filter.category = categoryDoc._id;
        }
      }
    }

    // Brand filter
    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Stock filter
    if (inStock === 'true') {
      filter['inventory.quantity'] = { $gt: 0 };
    }

    // Featured filter
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'price_asc':
        sortObj = { price: 1 };
        break;
      case 'price_desc':
        sortObj = { price: -1 };
        break;
      case 'rating':
        sortObj = { 'ratings.average': -1 };
        break;
      case 'popular':
        sortObj = { 'ratings.count': -1 };
        break;
      case 'newest':
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: total,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id)
      .populate('category', 'name slug')
      .populate('reviews.user', 'firstName lastName');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get related products
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isActive: true
    })
      .limit(4)
      .select('title price images ratings')
      .lean();

    res.json({
      success: true,
      data: {
        product,
        relatedProducts
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product'
    });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Product title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isMongoId()
    .withMessage('Valid category ID is required'),
  body('brand')
    .trim()
    .notEmpty()
    .withMessage('Brand is required'),
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .isUppercase()
    .withMessage('SKU must be uppercase'),
  body('inventory.quantity')
    .isInt({ min: 0 })
    .withMessage('Inventory quantity must be a non-negative integer')
], handleValidationErrors, async (req, res) => {
  try {
    const productData = req.body;

    // Normalize pricing: derive price/originalPrice/discount from any two
    if (typeof productData.discount === 'number' && productData.discount > 0) {
      const d = Math.min(100, Math.max(0, productData.discount));
      if (typeof productData.originalPrice === 'number' && productData.originalPrice > 0 && (productData.price === undefined || productData.price === null)) {
        productData.price = parseFloat((productData.originalPrice * (1 - d / 100)).toFixed(2));
      } else if (typeof productData.price === 'number' && productData.price > 0 && (productData.originalPrice === undefined || productData.originalPrice === null)) {
        productData.originalPrice = parseFloat((productData.price / (1 - d / 100)).toFixed(2));
      }
    }
    if ((productData.discount === undefined || productData.discount === null) &&
        typeof productData.originalPrice === 'number' && typeof productData.price === 'number' &&
        productData.originalPrice > productData.price) {
      productData.discount = Math.round(((productData.originalPrice - productData.price) / productData.originalPrice) * 100);
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: productData.sku });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    // Check if category exists
    const category = await Category.findById(productData.category);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product'
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Valid category ID is required'),
  body('brand')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Brand cannot be empty'),
  body('sku')
    .optional()
    .trim()
    .isUppercase()
    .withMessage('SKU must be uppercase'),
  body('inventory.quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Inventory quantity must be a non-negative integer')
], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Normalize pricing: derive price/originalPrice/discount from any two
    if (typeof updateData.discount === 'number' && updateData.discount > 0) {
      const d = Math.min(100, Math.max(0, updateData.discount));
      if (typeof updateData.originalPrice === 'number' && updateData.originalPrice > 0 && (updateData.price === undefined || updateData.price === null)) {
        updateData.price = parseFloat((updateData.originalPrice * (1 - d / 100)).toFixed(2));
      } else if (typeof updateData.price === 'number' && updateData.price > 0 && (updateData.originalPrice === undefined || updateData.originalPrice === null)) {
        updateData.originalPrice = parseFloat((updateData.price / (1 - d / 100)).toFixed(2));
      }
    }
    if ((updateData.discount === undefined || updateData.discount === null) &&
        typeof updateData.originalPrice === 'number' && typeof updateData.price === 'number' &&
        updateData.originalPrice > updateData.price) {
      updateData.discount = Math.round(((updateData.originalPrice - updateData.price) / updateData.originalPrice) * 100);
    }

    // Check if SKU already exists (excluding current product)
    if (updateData.sku) {
      const existingProduct = await Product.findOne({ 
        sku: updateData.sku, 
        _id: { $ne: id } 
      });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }
    }

    // Check if category exists
    if (updateData.category) {
      const category = await Category.findById(updateData.category);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product'
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product'
    });
  }
});

// @route   POST /api/products/:id/reviews
// @desc    Add product review
// @access  Private
router.post('/:id/reviews', protect, [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters')
], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, title } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Add review
    product.reviews.push({
      user: req.user._id,
      rating,
      comment,
      title,
      verified: true
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding review'
    });
  }
});

module.exports = router;


