// @ts-nocheck
export {};
const express = require('express');
const { body } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { handleValidationErrors, isValidObjectId } = require('../middleware/validation');

const router = express.Router();

// Require auth for all cart routes
router.use(protect);

// GET /api/cart - get current user's cart
router.get('/', async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'title images brand price inventory');
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    return res.json({ success: true, data: { cart } });
  } catch (e) {
    console.error('Get cart error:', e);
    return res.status(500).json({ success: false, message: 'Server error while fetching cart' });
  }
});

// POST /api/cart/items - add item (relaxed validation)
router.post('/items', async (req, res) => {
  try {
    const { product: productId, quantity, variant } = req.body || {};

    if (!productId || !isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: 'Valid product ID is required' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const qty = Math.max(1, parseInt(quantity as any, 10) || 1);

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const key = JSON.stringify(variant || null);
    const existing = cart.items.find(i => i.product.toString() === productId && JSON.stringify(i.variant || null) === key);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.items.push({ product: product._id, quantity: qty, variant: variant || null, price: product.price });
    }
    await cart.save();
    await cart.populate('items.product', 'title images brand price inventory');
    return res.status(201).json({ success: true, message: 'Item added to cart', data: { cart } });
  } catch (e) {
    console.error('Add item error:', e);
    return res.status(500).json({ success: false, message: 'Server error while adding item' });
  }
});

// PUT /api/cart/items/:productId - update quantity (relaxed validation)
router.put('/items/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, variant } = req.body || {};
    if (!isValidObjectId(productId)) return res.status(400).json({ success: false, message: 'Invalid product ID' });

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const key = JSON.stringify(variant || null);
    const idx = cart.items.findIndex(i => i.product.toString() === productId && JSON.stringify(i.variant || null) === key);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Item not found in cart' });

    const qty = Math.max(0, parseInt(quantity as any, 10) || 0);
    if (qty <= 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = qty;
    }
    await cart.save();
    await cart.populate('items.product', 'title images brand price inventory');
    return res.json({ success: true, message: 'Cart updated', data: { cart } });
  } catch (e) {
    console.error('Update item error:', e);
    return res.status(500).json({ success: false, message: 'Server error while updating item' });
  }
});

// DELETE /api/cart/items/:productId - remove item
router.delete('/items/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const variant = req.query.variant ? JSON.parse(req.query.variant) : null;
    if (!isValidObjectId(productId)) return res.status(400).json({ success: false, message: 'Invalid product ID' });

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const key = JSON.stringify(variant || null);
    cart.items = cart.items.filter(i => !(i.product.toString() === productId && JSON.stringify(i.variant || null) === key));
    await cart.save();
    await cart.populate('items.product', 'title images brand price inventory');
    return res.json({ success: true, message: 'Item removed', data: { cart } });
  } catch (e) {
    console.error('Remove item error:', e);
    return res.status(500).json({ success: false, message: 'Server error while removing item' });
  }
});

// DELETE /api/cart - clear cart
router.delete('/', async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    cart.items = [];
    await cart.save();
    return res.json({ success: true, message: 'Cart cleared', data: { cart } });
  } catch (e) {
    console.error('Clear cart error:', e);
    return res.status(500).json({ success: false, message: 'Server error while clearing cart' });
  }
});

module.exports = router;


