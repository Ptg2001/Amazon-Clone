// @ts-nocheck
export {};
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { body } = require('express-validator');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const { sendMail, renderOrderEmail, generateInvoicePdf } = require('../middleware/email');
const { handleValidationErrors, isValidObjectId } = require('../middleware/validation');

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route   POST /api/payments/create-payment-intent
// @desc    Create Razorpay order (kept path for frontend compatibility)
// @access  Private
router.post('/create-payment-intent', protect, [
  body('orderId')
    .isMongoId()
    .withMessage('Valid order ID is required')
], handleValidationErrors, async (req, res) => {
  try {
    const { orderId } = req.body;

    // Verify order exists and belongs to user
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      status: 'pending'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or already processed'
      });
    }

    // Amount to charge is the server-computed total in the order currency
    // Razorpay limits and currency specifics: INR supports UPI up to ₹1,00,000. Use currency minor units.
    const amount = order.pricing.total;

    // Create Razorpay order (amount in minor units; supports INR/EUR/GBP)
    const currency = (order.payment?.currency || 'INR').toUpperCase();
    const rzpOrder = await razorpay.orders.create({
      amount: Math.max(100, Math.round(amount * 100)), // minimum 1.00 unit safeguard
      currency,
      receipt: orderId,
      notes: { userId: req.user._id.toString() },
    });

    // Update order with razorpay order id
    order.payment.paymentIntentId = rzpOrder.id; // reuse field
    order.payment.gateway = 'razorpay';
    await order.save();

    res.json({
      success: true,
      data: {
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
      }
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating payment intent'
    });
  }
});

// @route   POST /api/payments/confirm-payment
// @desc    Verify Razorpay signature and update order (kept path)
// @access  Private
router.post('/confirm-payment', protect, [
  body('razorpayPaymentId').notEmpty().withMessage('razorpayPaymentId is required'),
  body('razorpayOrderId').notEmpty().withMessage('razorpayOrderId is required'),
  body('razorpaySignature').notEmpty().withMessage('razorpaySignature is required'),
  body('orderId')
    .isMongoId()
    .withMessage('Valid order ID is required')
], handleValidationErrors, async (req, res) => {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, orderId } = req.body;

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const generatedSignature = hmac.digest('hex');
    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Find and update order
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      'payment.paymentIntentId': razorpayOrderId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order payment status
    order.payment.status = 'paid';
    order.payment.transactionId = razorpayPaymentId;
    order.payment.paidAt = new Date();
    order.status = 'confirmed';
    order.addTimelineEntry('confirmed', 'Payment confirmed successfully', req.user._id);

    await order.save();

    // Email confirmation (best effort)
    try {
      const populated = await Order.findById(order._id)
        .populate('items.product', 'title')
        .populate('user', 'email');
      const mail = renderOrderEmail(populated);
      const pdfBuffer = await generateInvoicePdf(populated);
      await sendMail({
        to: req.user.email,
        subject: mail.subject,
        html: mail.html,
        attachments: [
          { filename: `invoice-${order.orderNumber || order._id}.pdf`, content: pdfBuffer },
        ],
      });
    } catch (e) {
      console.warn('Order confirmation email failed:', e?.message || e);
    }

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while confirming payment'
    });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Razorpay webhooks
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const body = req.body; // raw body buffer is provided by express.raw

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  if (expectedSignature !== signature) {
    return res.status(400).send('Invalid webhook signature');
  }

  try {
    const event = JSON.parse(body.toString());
    const evType = event.event;

    if (evType === 'payment.captured') {
      const payment = event.payload.payment.entity;
      await Order.findOneAndUpdate(
        { 'payment.transactionId': payment.id },
        {
          'payment.status': 'paid',
          'payment.paidAt': new Date(),
          status: 'confirmed',
        }
      );
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// @route   POST /api/payments/create-refund
// @desc    Create refund for order (Razorpay)
// @access  Private
router.post('/create-refund', protect, [
  body('orderId')
    .isMongoId()
    .withMessage('Valid order ID is required'),
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('reason')
    .optional()
    .isIn(['duplicate', 'fraudulent', 'requested_by_customer'])
    .withMessage('Invalid refund reason')
], handleValidationErrors, async (req, res) => {
  try {
    const { orderId, amount, reason = 'requested_by_customer' } = req.body;

    // Find order
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      'payment.status': 'paid'
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or not eligible for refund'
      });
    }

    // Check if order can be refunded
    if (!['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be refunded in current status'
      });
    }

    const refundAmount = amount ? Math.round(amount * 100) : Math.round(order.pricing.total * 100);

    // Create refund in Razorpay using payment_id
    const paymentId = order.payment.transactionId;
    const refund = await razorpay.payments.refund(paymentId, { amount: refundAmount, speed: 'normal' });

    // Update order refund status
    order.refund = {
      amount: refundAmount / 100,
      reason,
      status: refund.status || 'completed',
      refundId: refund.id,
      processedAt: new Date()
    };

    if (refundAmount === Math.round(order.pricing.total * 100)) {
      order.payment.status = 'refunded';
    } else {
      order.payment.status = 'partially_refunded';
    }

    order.addTimelineEntry('refunded', `Refund processed: ${refund.id}`, req.user._id);
    await order.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refundId: refund.id,
        amount: refundAmount / 100,
        status: refund.status
      }
    });
  } catch (error) {
    console.error('Create refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing refund'
    });
  }
});

// @route   GET /api/payments/methods
// @desc    Get user's saved payment methods
// @access  Private
router.get('/methods', protect, async (req, res) => {
  try {
    // In a real implementation, you would retrieve saved payment methods from Stripe
    // For now, we'll return the user's payment methods from the database
    const user = await User.findById(req.user._id).select('paymentMethods');
    
    res.json({
      success: true,
      data: {
        paymentMethods: user.paymentMethods || []
      }
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment methods'
    });
  }
});

// @route   POST /api/payments/methods
// @desc    Add new payment method
// @access  Private
router.post('/methods', protect, [
  body('type')
    .isIn(['card', 'paypal', 'amazon_pay'])
    .withMessage('Valid payment method type is required'),
  body('cardNumber')
    .optional()
    .isCreditCard()
    .withMessage('Valid card number is required'),
  body('expiryMonth')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Valid expiry month is required'),
  body('expiryYear')
    .optional()
    .isInt({ min: new Date().getFullYear() })
    .withMessage('Valid expiry year is required'),
  body('cardHolderName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Card holder name is required'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be boolean')
], handleValidationErrors, async (req, res) => {
  try {
    const paymentMethodData = req.body;

    // If this is set as default, unset other default payment methods
    if (paymentMethodData.isDefault) {
      await User.findByIdAndUpdate(
        req.user._id,
        { $set: { 'paymentMethods.$[].isDefault': false } }
      );
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { paymentMethods: paymentMethodData } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Payment method added successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding payment method'
    });
  }
});

// @route   DELETE /api/payments/methods/:methodId
// @desc    Delete payment method
// @access  Private
router.delete('/methods/:methodId', protect, async (req, res) => {
  try {
    const { methodId } = req.params;

    if (!isValidObjectId(methodId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method ID'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { paymentMethods: { _id: methodId } } },
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
      message: 'Payment method deleted successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting payment method'
    });
  }
});

module.exports = router;


