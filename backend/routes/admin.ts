// @ts-nocheck
export {};
const express = require('express');
const { body, query } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');
const { handleValidationErrors, isValidObjectId } = require('../middleware/validation');

const router = express.Router();

// All admin routes require admin role
router.use(protect, authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get order statistics (paid revenue) with simpler, robust pipelines
    const orderMatch = { ...dateFilter, 'payment.status': 'paid' };
    const ordersAgg = await Order.aggregate([
      { $match: orderMatch },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.total' },
          averageOrderValue: { $avg: '$pricing.total' },
        }
      }
    ]);
    // Detect if all paid orders share the same currency
    const currenciesAgg = await Order.aggregate([
      { $match: orderMatch },
      { $group: { _id: '$payment.currency', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const uniqueCurrencies = (currenciesAgg || []).filter(Boolean);
    const singleCurrency = uniqueCurrencies.length === 1 ? (uniqueCurrencies[0]._id || 'USD') : null;
    const statusAgg = await Order.aggregate([
      { $match: orderMatch },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const statusBreakdown = (statusAgg || []).reduce((acc, s) => {
      acc[s._id || 'unknown'] = s.count;
      return acc;
    }, {} as any);
    const orderStats = [
      {
        totalOrders: ordersAgg?.[0]?.totalOrders || 0,
        totalRevenue: Math.round((ordersAgg?.[0]?.totalRevenue || 0) * 100) / 100,
        averageOrderValue: Math.round((ordersAgg?.[0]?.averageOrderValue || 0) * 100) / 100,
        statusBreakdown,
      },
    ];

    // Get product statistics
    const productStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          lowStockProducts: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$isActive', true] },
                    { $lte: ['$inventory.quantity', '$inventory.lowStockThreshold'] }
                  ]
                },
                1,
                0
              ]
            }
          },
          outOfStockProducts: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$isActive', true] },
                    { $eq: ['$inventory.quantity', 0] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0] }
          },
          adminUsers: {
            $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get recent orders
    const recentOrders = await Order.find(dateFilter)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'title images')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('orderNumber user status pricing.total payment.currency createdAt')
      .lean();

    // Get top selling products
    const topProducts = await Order.aggregate([
      { $match: dateFilter },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          product: {
            title: 1,
            images: 1,
            price: 1,
            brand: 1
          },
          totalSold: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    // Get category statistics
    const categoryStats = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $project: {
          name: 1,
          slug: 1,
          productCount: { $size: '$products' },
          activeProductCount: {
            $size: {
              $filter: {
                input: '$products',
                cond: { $eq: ['$$this.isActive', true] }
              }
            }
          }
        }
      },
      { $sort: { productCount: -1 } },
      { $limit: 10 }
    ]);

    // Simple live totals irrespective of aggregates
    const [usersCount, productsCount, ordersCount, revenueAgg] = await Promise.all([
      User.countDocuments({}),
      Product.countDocuments({}),
      Order.countDocuments({}),
      Order.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: { _id: null, revenue: { $sum: '$pricing.total' } } }
      ])
    ]);

    // Native collection counts for diagnostics (same connection/db)
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    let native = { users: 0, products: 0, orders: 0 } as any;
    try {
      native.users = await db.collection('users').countDocuments();
      native.products = await db.collection('products').countDocuments();
      native.orders = await db.collection('orders').countDocuments();
    } catch (e) {
      native.error = e?.message || String(e);
    }

    res.json({
      success: true,
      data: {
        orderStats: {
          totalOrders: ordersCount || orderStats[0]?.totalOrders || 0,
          totalRevenue: (revenueAgg?.[0]?.revenue) || orderStats[0]?.totalRevenue || 0,
          averageOrderValue: orderStats[0]?.averageOrderValue || 0,
          statusBreakdown: orderStats[0]?.statusBreakdown || {},
          revenueCurrency: singleCurrency || null,
        },
        productStats: {
          totalProducts: productsCount || productStats[0]?.totalProducts || 0,
          activeProducts: productStats[0]?.activeProducts || 0,
          lowStockProducts: productStats[0]?.lowStockProducts || 0,
          outOfStockProducts: productStats[0]?.outOfStockProducts || 0,
        },
        userStats: {
          totalUsers: usersCount || userStats[0]?.totalUsers || 0,
          activeUsers: userStats[0]?.activeUsers || 0,
          adminUsers: userStats[0]?.adminUsers || 0,
        },
        totals: {
          users: usersCount || 0,
          products: productsCount || 0,
          orders: ordersCount || 0,
          revenue: (revenueAgg?.[0]?.revenue) || 0,
          revenueCurrency: singleCurrency || null,
        },
        debugCounts: native,
        recentOrders,
        topProducts,
        categoryStats
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics'
    });
  }
});

// @route   GET /api/admin/orders
// @desc    Get all orders with filtering and pagination
// @access  Private (Admin only)
router.get('/orders', [
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
    .withMessage('Invalid status filter'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be valid ISO date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be valid ISO date')
], handleValidationErrors, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      startDate,
      endDate,
      search
    } = req.query;

    // Build filter
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'user.firstName': { $regex: search, $options: 'i' } },
        { 'user.lastName': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email')
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
    console.error('Get admin orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

// @route   DELETE /api/admin/orders/:id
// @desc    Delete an order by ID
// @access  Private (Admin only)
router.delete('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await Order.deleteOne({ _id: id });

    return res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Admin delete order error:', error);
    return res.status(500).json({ success: false, message: 'Server error while deleting order' });
  }
});

// @route   GET /api/admin/products
// @desc    Get all products with admin details
// @access  Private (Admin only)
router.get('/products', [
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
    .isIn(['active', 'inactive', 'low_stock', 'out_of_stock'])
    .withMessage('Invalid status filter')
], handleValidationErrors, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      category
    } = req.query;

    // Build filter
    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }

    if (category) {
      filter.category = category;
    }

    if (status) {
      switch (status) {
        case 'active':
          filter.isActive = true;
          break;
        case 'inactive':
          filter.isActive = false;
          break;
        case 'low_stock':
          filter.isActive = true;
          filter.$expr = {
            $lte: ['$inventory.quantity', '$inventory.lowStockThreshold']
          };
          break;
        case 'out_of_stock':
          filter.isActive = true;
          filter['inventory.quantity'] = 0;
          break;
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
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
    console.error('Get admin products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with admin details
// @access  Private (Admin only)
router.get('/users', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Invalid role filter'),
  query('verified')
    .optional()
    .isBoolean()
    .withMessage('Verified must be boolean')
], handleValidationErrors, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      verified,
      search
    } = req.query;

    // Build filter
    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (verified !== undefined) {
      filter.isEmailVerified = verified === 'true';
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const users = await User.find(filter)
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count
    const total = await User.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers: total,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user details (admin)
// @access  Private (Admin only)
router.put('/users/:id', [
  body('firstName').optional().isString().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').optional().isString().isLength({ min: 1 }).withMessage('Last name is required'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isString(),
  body('role').optional().isIn(['user', 'admin']).withMessage('Role must be user or admin'),
  body('isEmailVerified').optional().isBoolean(),
  body('isActive').optional().isBoolean(),
], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    // Prevent admin from changing their own role
    if (req.body.role && id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role' });
    }

    const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'role', 'isEmailVerified', 'isActive'];
    const updateData = {} as any;
    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        updateData[key] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User updated successfully', data: { user } });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ success: false, message: 'Server error while updating user' });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin only)
router.put('/users/:id/role', [
  body('role')
    .isIn(['user', 'admin'])
    .withMessage('Role must be user or admin')
], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Prevent admin from changing their own role
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user role'
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Prevent admin from deleting themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Check if user has orders
    const orderCount = await Order.countDocuments({ user: id });
    if (orderCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete user. User has ${orderCount} orders.`
      });
    }

    // Use findByIdAndDelete and also remove related data if needed in future
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
});

module.exports = router;


