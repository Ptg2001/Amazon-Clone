// @ts-nocheck
export {};
const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public content endpoints

// In-memory hero slides configuration (can be replaced by DB later)
let heroSlides = [
  {
    id: 1,
    title: 'New Arrivals',
    subtitle: 'Discover the latest products',
    description: 'Shop the newest collection of electronics, fashion, and home goods',
    image: 'https://www.crazydomains.com/learn/wp-content/uploads/2021/04/5-eCommerce-Products-To-Sell-in-2021-main-image_728x365.jpg',
    link: '/search?q=new+arrivals',
    buttonText: 'Shop Now',
  },
  {
    id: 2,
    title: 'Electronics Sale',
    subtitle: 'Up to 50% off',
    description: 'Get amazing deals on smartphones, laptops, and gadgets',
    image: 'https://img.freepik.com/premium-photo/headphones_920207-9739.jpg',
    link: '/category/electronics',
    buttonText: 'View Deals',
  },
  {
    id: 3,
    title: 'Free Shipping',
    subtitle: 'On orders over $50',
    description: 'Enjoy free shipping on millions of items',
    image: 'https://www.geeky-gadgets.com/wp-content/uploads/2024/06/iPhone-16-Pro-Max-1.jpg',
    link: '/search?q=free+shipping',
    buttonText: 'Learn More',
  },
];

router.get('/hero', (_req, res) => {
  res.json({ success: true, data: { slides: heroSlides } });
});

// Optional: update slides dynamically (simple, unsecured demo endpoint)
router.put('/hero', protect, authorize('admin'), (req, res) => {
  try {
    const { slides } = req.body || {};
    if (!Array.isArray(slides)) {
      return res.status(400).json({ success: false, message: 'slides must be an array' });
    }
    // Basic validation and normalization
    heroSlides = slides
      .filter((s) => s && typeof s === 'object')
      .map((s, idx) => ({
        id: s.id || idx + 1,
        title: String(s.title || ''),
        subtitle: s.subtitle ? String(s.subtitle) : '',
        description: s.description ? String(s.description) : '',
        image: String(s.image || ''),
        link: s.link ? String(s.link) : '/',
        buttonText: s.buttonText ? String(s.buttonText) : 'Shop Now',
      }))
      .filter((s) => s.title && s.image);
    res.json({ success: true, data: { slides: heroSlides } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update slides' });
  }
});

module.exports = router;


