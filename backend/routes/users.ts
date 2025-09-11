// @ts-nocheck
export {};
const express = require('express');
const { body, query } = require('express-validator');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, checkOwnership } = require('../middleware/auth');
const { handleValidationErrors, isValidObjectId } = require('../middleware/validation');
const axios = require('axios');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist', 'title price images ratings')
      .populate('orderHistory', 'orderNumber status pricing.total createdAt');

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// Payment Methods
// @route   GET /api/users/payment-methods
// @desc    Get user's payment methods
// @access  Private
router.get('/payment-methods', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('paymentMethods');
    return res.json({ success: true, data: { paymentMethods: user?.paymentMethods || [] } });
  } catch (error) {
    console.error('Get payment methods error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching payment methods' });
  }
});

// @route   POST /api/users/payment-methods
// @desc    Add a new payment method
// @access  Private
router.post('/payment-methods', protect, [
  body('type').isIn(['card', 'paypal', 'amazon_pay']).withMessage('Invalid payment method type'),
  body('cardNumber').optional().isLength({ min: 4 }).withMessage('Card number must be at least last 4'),
  body('expiryMonth').optional().isString(),
  body('expiryYear').optional().isString(),
  body('cardHolderName').optional().isString(),
  body('isDefault').optional().isBoolean(),
], handleValidationErrors, async (req, res) => {
  try {
    const method = req.body;
    if (method.isDefault) {
      await User.findByIdAndUpdate(req.user._id, { $set: { 'paymentMethods.$[].isDefault': false } });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { paymentMethods: method } },
      { new: true }
    ).select('paymentMethods');
    return res.status(201).json({ success: true, message: 'Payment method added', data: { paymentMethods: user.paymentMethods } });
  } catch (error) {
    console.error('Add payment method error:', error);
    return res.status(500).json({ success: false, message: 'Server error while adding payment method' });
  }
});

// @route   PUT /api/users/payment-methods/:methodId
// @desc    Update a payment method
// @access  Private
router.put('/payment-methods/:methodId', protect, [
  body('cardHolderName').optional().isString(),
  body('expiryMonth').optional().isString(),
  body('expiryYear').optional().isString(),
  body('isDefault').optional().isBoolean(),
], handleValidationErrors, async (req, res) => {
  try {
    const { methodId } = req.params;
    if (!isValidObjectId(methodId)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method ID' });
    }
    const update = req.body || {};
    if (update.isDefault) {
      await User.findByIdAndUpdate(req.user._id, { $set: { 'paymentMethods.$[].isDefault': false } });
    }
    const user = await User.findOneAndUpdate(
      { _id: req.user._id, 'paymentMethods._id': methodId },
      { $set: Object.keys(update).reduce((acc, key) => { acc[`paymentMethods.$.${key}`] = update[key]; return acc; }, {}) },
      { new: true }
    ).select('paymentMethods');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Payment method not found' });
    }
    return res.json({ success: true, message: 'Payment method updated', data: { paymentMethods: user.paymentMethods } });
  } catch (error) {
    console.error('Update payment method error:', error);
    return res.status(500).json({ success: false, message: 'Server error while updating payment method' });
  }
});

// @route   DELETE /api/users/payment-methods/:methodId
// @desc    Delete a payment method
// @access  Private
router.delete('/payment-methods/:methodId', protect, async (req, res) => {
  try {
    const { methodId } = req.params;
    if (!isValidObjectId(methodId)) {
      return res.status(400).json({ success: false, message: 'Invalid payment method ID' });
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { paymentMethods: { _id: methodId } } },
      { new: true }
    ).select('paymentMethods');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, message: 'Payment method removed', data: { paymentMethods: user.paymentMethods } });
  } catch (error) {
    console.error('Delete payment method error:', error);
    return res.status(500).json({ success: false, message: 'Server error while deleting payment method' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('preferences.newsletter')
    .optional()
    .isBoolean()
    .withMessage('Newsletter preference must be boolean'),
  body('preferences.smsNotifications')
    .optional()
    .isBoolean()
    .withMessage('SMS notifications preference must be boolean'),
  body('preferences.emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('Email notifications preference must be boolean')
], handleValidationErrors, async (req, res) => {
  try {
    const updateData = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @route   POST /api/users/addresses
// @desc    Add new address
// @access  Private
router.post('/addresses', protect, [
  body('type')
    .isIn(['home', 'work', 'other'])
    .withMessage('Address type must be home, work, or other'),
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('address1')
    .trim()
    .notEmpty()
    .withMessage('Address line 1 is required'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required'),
  body('country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country must be a 2-letter code'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be boolean')
], handleValidationErrors, async (req, res) => {
  try {
    const addressData = req.body;

    // If this is set as default, unset other default addresses
    if (addressData.isDefault) {
      await User.findByIdAndUpdate(
        req.user._id,
        { $set: { 'addresses.$[].isDefault': false } }
      );
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { addresses: addressData } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding address'
    });
  }
});

// @route   PUT /api/users/addresses/:addressId
// @desc    Update address
// @access  Private
router.put('/addresses/:addressId', protect, [
  body('type')
    .optional()
    .isIn(['home', 'work', 'other'])
    .withMessage('Address type must be home, work, or other'),
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Last name cannot be empty'),
  body('address1')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Address line 1 cannot be empty'),
  body('city')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('City cannot be empty'),
  body('state')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('State cannot be empty'),
  body('zipCode')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Zip code cannot be empty'),
  body('country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Country must be a 2-letter code'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be boolean')
], handleValidationErrors, async (req, res) => {
  try {
    const { addressId } = req.params;
    const updateData = req.body;

    if (!isValidObjectId(addressId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address ID'
      });
    }

    // If this is set as default, unset other default addresses
    if (updateData.isDefault) {
      await User.findByIdAndUpdate(
        req.user._id,
        { $set: { 'addresses.$[].isDefault': false } }
      );
    }

    const user = await User.findOneAndUpdate(
      { 
        _id: req.user._id,
        'addresses._id': addressId 
      },
      { 
        $set: Object.keys(updateData).reduce((acc, key) => {
          acc[`addresses.$.${key}`] = updateData[key];
          return acc;
        }, {})
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating address'
    });
  }
});

// @route   DELETE /api/users/addresses/:addressId
// @desc    Delete address
// @access  Private
router.delete('/addresses/:addressId', protect, async (req, res) => {
  try {
    const { addressId } = req.params;

    if (!isValidObjectId(addressId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address ID'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Address deleted successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting address'
    });
  }
});

// @route   POST /api/users/wishlist/:productId
// @desc    Add product to wishlist
// @access  Private
router.post('/wishlist/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product is already in wishlist
    const user = await User.findById(req.user._id);
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add to wishlist
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { wishlist: productId } }
    );

    res.json({
      success: true,
      message: 'Product added to wishlist successfully'
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding to wishlist'
    });
  }
});

// @route   DELETE /api/users/wishlist/:productId
// @desc    Remove product from wishlist
// @access  Private
router.delete('/wishlist/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    // Remove from wishlist
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { wishlist: productId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Product removed from wishlist successfully'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing from wishlist'
    });
  }
});

// @route   GET /api/users/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('wishlist', 'title price images ratings brand category');

    res.json({
      success: true,
      data: { wishlist: user.wishlist }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist'
    });
  }
});

// @route   GET /api/users/orders
// @desc    Get user's order history
// @access  Private
router.get('/orders', protect, [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])
    .withMessage('Invalid status filter')
], handleValidationErrors, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate
    } = req.query;

    // Build filter
    const filter = { user: req.user._id };

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const orders = await Order.find(filter)
      .populate('items.product', 'title images brand')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await Order.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders: total,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get order statistics
    const orderStats = await Order.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$pricing.total' },
          averageOrderValue: { $avg: '$pricing.total' },
          statusCounts: {
            $push: {
              status: '$status',
              count: 1
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalOrders: 1,
          totalSpent: { $round: ['$totalSpent', 2] },
          averageOrderValue: { $round: ['$averageOrderValue', 2] },
          statusBreakdown: {
            $reduce: {
              input: '$statusCounts',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [
                      [{
                        k: '$$this.status',
                        v: { $sum: ['$$value.$$this.status', '$$this.count'] }
                      }]
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    ]);

    // Get wishlist count
    const wishlistCount = await User.findById(userId).select('wishlist');
    const wishlistLength = wishlistCount ? wishlistCount.wishlist.length : 0;

    // Get recent orders
    const recentOrders = await Order.find({ user: userId })
      .populate('items.product', 'title images')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber status pricing.total createdAt')
      .lean();

    res.json({
      success: true,
      data: {
        orderStats: orderStats[0] || {
          totalOrders: 0,
          totalSpent: 0,
          averageOrderValue: 0,
          statusBreakdown: {}
        },
        wishlistCount: wishlistLength,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user statistics'
    });
  }
});

// @route   GET /api/users/fx-rates
// @desc    Get live FX rates (base USD) cached for 1 hour
// @access  Public
let cachedFx = { ts: 0, rates: {} } as any;
router.get('/fx-rates', async (_req, res) => {
  try {
    const now = Date.now();
    if (cachedFx.ts && now - cachedFx.ts < 60 * 60 * 1000 && cachedFx.rates && Object.keys(cachedFx.rates).length) {
      return res.json({ success: true, data: { base: 'USD', rates: cachedFx.rates, cached: true } });
    }

    const apiKey = process.env.EXCHANGE_RATES_API_KEY;
    // Use open.er-api.com free endpoint (no key) as fallback
    const url = apiKey
      ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
      : 'https://open.er-api.com/v6/latest/USD';
    const { data } = await axios.get(url, { timeout: 8000 });
    const rates = data?.conversion_rates || data?.rates || {};
    if (!rates || Object.keys(rates).length === 0) throw new Error('No rates');
    cachedFx = { ts: now, rates };
    return res.json({ success: true, data: { base: 'USD', rates, cached: false } });
  } catch (e) {
    console.error('FX rates error:', e?.message || e);
    // Serve last cached if available
    if (cachedFx.rates && Object.keys(cachedFx.rates).length) {
      return res.json({ success: true, data: { base: 'USD', rates: cachedFx.rates, cached: true } });
    }
    return res.status(503).json({ success: false, message: 'FX service unavailable' });
  }
});

// @route   GET /api/users/geo
// @desc    Detect user country from IP (server-side to avoid CORS)
// @access  Public
router.get('/geo', async (req, res) => {
  try {
    // Prefer ipapi.co; fallback to ipwho.is
    let code: string | undefined;
    try {
      const { data } = await axios.get('https://ipapi.co/json/', { timeout: 6000 });
      code = (data && (data.country || data.country_code)) as string | undefined;
    } catch (_e) {
      const { data } = await axios.get('https://ipwho.is/', { timeout: 6000 });
      code = (data && (data.country_code || data.countryCode)) as string | undefined;
    }
    if (!code || typeof code !== 'string') throw new Error('Geo lookup failed');
    return res.json({ success: true, data: { countryCode: code.toUpperCase() } });
  } catch (error) {
    console.error('Geo detect error:', error?.message || error);
    // Graceful fallback
    return res.json({ success: true, data: { countryCode: 'US' } });
  }
});

module.exports = router;



