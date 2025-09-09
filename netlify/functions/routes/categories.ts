// @ts-nocheck
export {};
const express = require('express');
const { body, query } = require('express-validator');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors, isValidObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories with optional tree structure
// @access  Public
router.get('/', [
  query('tree')
    .optional()
    .isBoolean()
    .withMessage('Tree must be a boolean value'),
  query('includeProducts')
    .optional()
    .isBoolean()
    .withMessage('IncludeProducts must be a boolean value'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
], handleValidationErrors, async (req, res) => {
  try {
    const { tree = false, includeProducts = false, limit } = req.query;

    let categories;

    if (tree === 'true') {
      // Get hierarchical tree structure
      categories = await Category.getCategoryTree();
    } else {
      // Get flat list
      let queryBuilder = Category.find({ isActive: true })
        .sort({ level: 1, sortOrder: 1 })
        .populate('parent', 'name slug');

      if (limit) {
        queryBuilder = queryBuilder.limit(parseInt(limit));
      }

      categories = await queryBuilder.lean();

      // Include product counts if requested
      if (includeProducts === 'true') {
        for (const category of categories) {
          const productCount = await Product.countDocuments({
            category: category._id,
            isActive: true
          });
          category.productsCount = productCount;
        }
      }
    }

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category by ID or slug
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    let category;
    
    if (isValidObjectId(id)) {
      category = await Category.findById(id)
        .populate('parent', 'name slug')
        .populate('childrenCount')
        .populate('productsCount');
    } else {
      category = await Category.findOne({ slug: id })
        .populate('parent', 'name slug')
        .populate('childrenCount')
        .populate('productsCount');
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get category products
    const products = await Product.find({
      category: category._id,
      isActive: true
    })
      .select('title price images ratings brand')
      .limit(12)
      .lean();

    // Get subcategories
    const subcategories = await Category.find({
      parent: category._id,
      isActive: true
    })
      .select('name slug image')
      .sort({ sortOrder: 1 })
      .lean();

    res.json({
      success: true,
      data: {
        category,
        products,
        subcategories
      }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category'
    });
  }
});

// @route   POST /api/categories
// @desc    Create new category
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 100 })
    .withMessage('Category name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('parent')
    .optional()
    .isMongoId()
    .withMessage('Valid parent category ID is required'),
  body('image.url')
    .optional()
    .isURL()
    .withMessage('Image URL must be valid'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer')
], handleValidationErrors, async (req, res) => {
  try {
    const categoryData = req.body;

    // Check if category name already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${categoryData.name}$`, 'i') } 
    });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Check if parent category exists
    if (categoryData.parent) {
      const parentCategory = await Category.findById(categoryData.parent);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating category'
    });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category name cannot exceed 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('parent')
    .optional()
    .isMongoId()
    .withMessage('Valid parent category ID is required'),
  body('image.url')
    .optional()
    .isURL()
    .withMessage('Image URL must be valid'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer')
], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    // Check if category name already exists (excluding current category)
    if (updateData.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
        _id: { $ne: id }
      });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    // Check if parent category exists and prevent circular reference
    if (updateData.parent) {
      if (updateData.parent === id) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be its own parent'
        });
      }

      const parentCategory = await Category.findById(updateData.parent);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }

      // Check for circular reference
      const descendants = await Category.findById(id).getDescendants();
      const descendantIds = descendants.map(d => d._id.toString());
      if (descendantIds.includes(updateData.parent)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot set parent to a descendant category'
        });
      }
    }

    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating category'
    });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${productCount} products. Please move or delete the products first.`
      });
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parent: id });
    if (subcategoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${subcategoryCount} subcategories. Please delete the subcategories first.`
      });
    }

    await Category.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting category'
    });
  }
});

// @route   GET /api/categories/:id/products
// @desc    Get products in a category with pagination
// @access  Public
router.get('/:id/products', [
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
    .isIn(['price_asc', 'price_desc', 'rating', 'newest', 'popular'])
    .withMessage('Invalid sort option')
], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 20,
      sort = 'newest',
      minPrice,
      maxPrice,
      brand
    } = req.query;

    let category;
    
    if (isValidObjectId(id)) {
      category = await Category.findById(id);
    } else {
      category = await Category.findOne({ slug: id });
    }

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get all descendant categories
    const descendants = await category.getDescendants();
    const categoryIds = [category._id, ...descendants.map(d => d._id)];

    // Build filter
    const filter = {
      category: { $in: categoryIds },
      isActive: true
    };

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Brand filter
    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
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

    // Get total count
    const total = await Product.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        category,
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
    console.error('Get category products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category products'
    });
  }
});

module.exports = router;


