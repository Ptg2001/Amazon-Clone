// @ts-nocheck
export {};
const express = require('express');
const { body, query } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, checkOwnership } = require('../middleware/auth');
const { handleValidationErrors, isValidObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/orders
// @desc    Get user's orders with pagination
// @access  Private
router.get('/', protect, [
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
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    const order = await Order.findById(id)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'title images brand specifications');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.product')
    .isMongoId()
    .withMessage('Valid product ID is required for each item'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1 for each item'),
  body('shippingAddress.firstName')
    .trim()
    .notEmpty()
    .withMessage('Shipping address first name is required'),
  body('shippingAddress.lastName')
    .trim()
    .notEmpty()
    .withMessage('Shipping address last name is required'),
  body('shippingAddress.address1')
    .trim()
    .notEmpty()
    .withMessage('Shipping address line 1 is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('Shipping address city is required'),
  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('Shipping address state is required'),
  body('shippingAddress.zipCode')
    .trim()
    .notEmpty()
    .withMessage('Shipping address zip code is required'),
  body('payment.method')
    .isIn(['card', 'paypal', 'amazon_pay', 'cash_on_delivery'])
    .withMessage('Valid payment method is required')
], handleValidationErrors, async (req, res) => {
  try {
    const { items, shippingAddress, billingAddress, payment, notes } = req.body;

    // Determine currency from shipping country
    const country = (shippingAddress?.country || '').toUpperCase();
    let currency = 'USD';
    if (country === 'IN' || country === 'INDIA') currency = 'INR';
    else if (country === 'GB' || country === 'UK' || country === 'UNITED KINGDOM') currency = 'GBP';
    else if (['EU','DE','FR','IT','ES','NL'].includes(country)) currency = 'EUR';

    // FX rate once
    let fxRate = 1;
    if (currency !== 'USD') {
      try {
        const axios = require('axios');
        const now = Date.now();
        if (!(global as any).__fxCache) (global as any).__fxCache = { ts: 0, rates: {} };
        const fxCache = (global as any).__fxCache;
        if (!fxCache.ts || now - fxCache.ts > 60 * 60 * 1000) {
          const apiKey = process.env.EXCHANGE_RATES_API_KEY;
          const url = apiKey ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD` : 'https://open.er-api.com/v6/latest/USD';
          const { data } = await axios.get(url, { timeout: 8000 });
          const rates = data?.conversion_rates || data?.rates || {};
          if (rates && Object.keys(rates).length) { fxCache.ts = now; fxCache.rates = rates; }
        }
        fxRate = (global as any).__fxCache.rates?.[currency] || 1;
      } catch (_) { fxRate = 1; }
    }

    // Validate products and calculate totals using target currency unit prices
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.title} is no longer available`
        });
      }

      if (product.inventory.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.title}. Available: ${product.inventory.quantity}`
        });
      }

      const unitPrice = fxRate && fxRate !== 1 ? parseFloat((product.price * fxRate).toFixed(2)) : product.price;
      const itemTotal = parseFloat((unitPrice * item.quantity).toFixed(2));
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: unitPrice,
        total: itemTotal,
        variant: item.variant || null
      });
    }


    const tax = parseFloat((subtotal * 0.08).toFixed(2));

    // Shipping by currency thresholds
    const freeThreshold = currency === 'INR' ? 4000 : (currency === 'EUR' || currency === 'GBP') ? 50 : 50;
    const baseShip = currency === 'INR' ? 149 : (currency === 'EUR' || currency === 'GBP') ? 6.99 : 9.99;
    const shipping = subtotal >= freeThreshold ? 0 : baseShip;

    // Calculate total
    const total = parseFloat((subtotal + tax + shipping).toFixed(2));

    // Create order
    const orderData = {
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      payment: {
        method: payment.method,
        amount: total,
        currency,
      },
      pricing: {
        subtotal,
        tax,
        shipping,
        total
      },
      notes
    };

    const order = await Order.create(orderData);

    // Update product inventory
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { 'inventory.quantity': -item.quantity } }
      );
    }

    // Add initial timeline entry
    order.addTimelineEntry('pending', 'Order placed successfully', req.user._id);
    await order.save();

    // Populate order for response
    await order.populate('items.product', 'title images brand');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order'
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Admin only)
router.put('/:id/status', protect, checkOwnership('user'), [
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])
    .withMessage('Valid status is required'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters'),
  body('tracking.carrier')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Carrier cannot be empty'),
  body('tracking.trackingNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Tracking number cannot be empty')
], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message, tracking } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.updateStatus(status, message || `Order status updated to ${status}`, req.user._id);

    // Update tracking if provided
    if (tracking) {
      order.tracking = { ...order.tracking, ...tracking };
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
});

// @route   POST /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own orders.'
      });
    }

    // Check if order can be cancelled
    if (['cancelled', 'delivered', 'shipped'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled. Current status: ${order.status}`
      });
    }

    // Cancel order
    order.updateStatus('cancelled', reason || 'Order cancelled by customer', req.user._id);
    order.payment.status = 'refunded';

    // Restore product inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { 'inventory.quantity': item.quantity } }
      );
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling order'
    });
  }
});

// @route   POST /api/orders/:id/return
// @desc    Request order return
// @access  Private
router.post('/:id/return', protect, [
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Return reason is required')
    .isLength({ max: 500 })
    .withMessage('Return reason cannot exceed 500 characters'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item must be selected for return'),
  body('items.*.itemId')
    .isMongoId()
    .withMessage('Valid item ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Return quantity must be at least 1')
], handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, items } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only return your own orders.'
      });
    }

    // Check if order can be returned
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Only delivered orders can be returned'
      });
    }

    // Validate return items
    const returnItems = [];
    let returnAmount = 0;

    for (const returnItem of items) {
      const orderItem = order.items.find(item => item._id.toString() === returnItem.itemId);
      if (!orderItem) {
        return res.status(400).json({
          success: false,
          message: `Item with ID ${returnItem.itemId} not found in order`
        });
      }

      if (returnItem.quantity > orderItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Return quantity cannot exceed ordered quantity for item ${orderItem.product.title}`
        });
      }

      returnItems.push({
        itemId: returnItem.itemId,
        quantity: returnItem.quantity,
        amount: (orderItem.price * returnItem.quantity)
      });

      returnAmount += (orderItem.price * returnItem.quantity);
    }

    // Create return request
    order.refund = {
      amount: returnAmount,
      reason,
      status: 'pending',
      requestedAt: new Date()
    };

    order.updateStatus('returned', `Return requested: ${reason}`, req.user._id);
    await order.save();

    res.json({
      success: true,
      message: 'Return request submitted successfully',
      data: { 
        order,
        returnItems,
        returnAmount
      }
    });
  } catch (error) {
    console.error('Request return error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing return request'
    });
  }
});

module.exports = router;


