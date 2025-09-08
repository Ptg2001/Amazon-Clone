// @ts-nocheck
export {};
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('../models/Product');
const Category = require('../models/Category');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/amazon-clone', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample product data for all categories
const productsData = [
  // Electronics - Smartphones & Accessories
  {
    title: 'iPhone 15 Pro Max',
    description: 'The most advanced iPhone with titanium design, A17 Pro chip, and Pro camera system with 5x Telephoto zoom.',
    shortDescription: 'Latest iPhone with titanium design and Pro camera system',
    price: 1199.99,
    originalPrice: 1299.99,
    discount: 8,
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    sku: 'IPH15PM-256GB',
    images: [
      { url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', alt: 'iPhone 15 Pro Max', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', alt: 'iPhone 15 Pro Max back' }
    ],
    specifications: [
      { name: 'Display', value: '6.7-inch Super Retina XDR' },
      { name: 'Storage', value: '256GB' },
      { name: 'Camera', value: '48MP Main, 12MP Ultra Wide, 12MP Telephoto' },
      { name: 'Battery', value: 'Up to 29 hours video playback' }
    ],
    features: ['Titanium design', 'A17 Pro chip', '5x Telephoto zoom', 'Action Button', 'USB-C'],
    dimensions: { length: 6.29, width: 3.02, height: 0.32, weight: 7.81, unit: 'in' },
    inventory: { quantity: 50, lowStockThreshold: 10 },
    shipping: { weight: 0.5, freeShipping: true, estimatedDelivery: { min: 1, max: 3 } },
    ratings: { average: 4.8, count: 1250 },
    tags: ['smartphone', 'apple', 'iphone', 'premium', 'camera'],
    isFeatured: true,
    subcategory: 'Smartphones'
  },
  {
    title: 'Samsung Galaxy S24 Ultra',
    description: 'Premium Android smartphone with S Pen, 200MP camera, and AI-powered features.',
    shortDescription: 'Premium Android phone with S Pen and 200MP camera',
    price: 1299.99,
    originalPrice: 1399.99,
    discount: 7,
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    sku: 'SGS24U-512GB',
    images: [
      { url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', alt: 'Samsung Galaxy S24 Ultra', isPrimary: true }
    ],
    specifications: [
      { name: 'Display', value: '6.8-inch Dynamic AMOLED 2X' },
      { name: 'Storage', value: '512GB' },
      { name: 'Camera', value: '200MP Main, 50MP Periscope, 10MP Telephoto' },
      { name: 'S Pen', value: 'Included' }
    ],
    features: ['S Pen included', '200MP camera', 'AI features', 'Titanium frame', 'Wireless charging'],
    dimensions: { length: 6.43, width: 3.12, height: 0.34, weight: 8.22, unit: 'in' },
    inventory: { quantity: 35, lowStockThreshold: 10 },
    shipping: { weight: 0.5, freeShipping: true, estimatedDelivery: { min: 1, max: 3 } },
    ratings: { average: 4.7, count: 890 },
    tags: ['smartphone', 'samsung', 'android', 's-pen', 'camera'],
    isFeatured: true,
    subcategory: 'Smartphones'
  },

  // Electronics - Computers & Tablets
  {
    title: 'MacBook Pro 16-inch M3 Max',
    description: 'Powerful laptop with M3 Max chip, Liquid Retina XDR display, and up to 22 hours of battery life.',
    shortDescription: 'Professional laptop with M3 Max chip and stunning display',
    price: 3499.99,
    originalPrice: 3699.99,
    discount: 5,
    brand: 'Apple',
    model: 'MacBook Pro 16-inch',
    sku: 'MBP16-M3MAX-1TB',
    images: [
      { url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500', alt: 'MacBook Pro 16-inch', isPrimary: true }
    ],
    specifications: [
      { name: 'Processor', value: 'Apple M3 Max chip' },
      { name: 'Display', value: '16.2-inch Liquid Retina XDR' },
      { name: 'Storage', value: '1TB SSD' },
      { name: 'Memory', value: '32GB unified memory' }
    ],
    features: ['M3 Max chip', 'Liquid Retina XDR display', 'Up to 22h battery', '1080p FaceTime camera', 'Six-speaker sound system'],
    dimensions: { length: 14.01, width: 9.77, height: 0.66, weight: 4.7, unit: 'in' },
    inventory: { quantity: 25, lowStockThreshold: 5 },
    shipping: { weight: 4.7, freeShipping: true, estimatedDelivery: { min: 2, max: 5 } },
    ratings: { average: 4.9, count: 450 },
    tags: ['laptop', 'macbook', 'apple', 'professional', 'm3-max'],
    isFeatured: true,
    subcategory: 'Laptops'
  },
  {
    title: 'iPad Pro 12.9-inch M2',
    description: 'Professional tablet with M2 chip, Liquid Retina XDR display, and Apple Pencil support.',
    shortDescription: 'Professional tablet with M2 chip and stunning display',
    price: 1099.99,
    originalPrice: 1199.99,
    discount: 8,
    brand: 'Apple',
    model: 'iPad Pro 12.9-inch',
    sku: 'IPADPRO12-M2-256GB',
    images: [
      { url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500', alt: 'iPad Pro 12.9-inch', isPrimary: true }
    ],
    specifications: [
      { name: 'Processor', value: 'Apple M2 chip' },
      { name: 'Display', value: '12.9-inch Liquid Retina XDR' },
      { name: 'Storage', value: '256GB' },
      { name: 'Connectivity', value: 'Wi-Fi + Cellular' }
    ],
    features: ['M2 chip', 'Liquid Retina XDR display', 'Apple Pencil support', 'Magic Keyboard compatible', '5G ready'],
    dimensions: { length: 11.05, width: 8.46, height: 0.25, weight: 1.5, unit: 'in' },
    inventory: { quantity: 40, lowStockThreshold: 10 },
    shipping: { weight: 1.5, freeShipping: true, estimatedDelivery: { min: 1, max: 3 } },
    ratings: { average: 4.8, count: 720 },
    tags: ['tablet', 'ipad', 'apple', 'professional', 'm2'],
    isFeatured: true,
    subcategory: 'Tablets'
  },

  // Electronics - Audio & Headphones
  {
    title: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise canceling with Dual Noise Sensor technology and 30-hour battery life.',
    shortDescription: 'Premium noise-canceling wireless headphones',
    price: 399.99,
    originalPrice: 449.99,
    discount: 11,
    brand: 'Sony',
    model: 'WH-1000XM5',
    sku: 'SONY-WH1000XM5',
    images: [
      { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', alt: 'Sony WH-1000XM5 Headphones', isPrimary: true }
    ],
    specifications: [
      { name: 'Driver Unit', value: '30mm' },
      { name: 'Frequency Response', value: '4Hz-40kHz' },
      { name: 'Battery Life', value: '30 hours' },
      { name: 'Connectivity', value: 'Bluetooth 5.2' }
    ],
    features: ['Industry-leading noise canceling', '30-hour battery life', 'Quick charge', 'Speak-to-Chat', 'Multipoint connection'],
    dimensions: { length: 10.2, width: 7.1, height: 3.0, weight: 0.55, unit: 'in' },
    inventory: { quantity: 60, lowStockThreshold: 15 },
    shipping: { weight: 0.55, freeShipping: true, estimatedDelivery: { min: 1, max: 3 } },
    ratings: { average: 4.6, count: 2100 },
    tags: ['headphones', 'wireless', 'noise-canceling', 'sony', 'premium'],
    isFeatured: true,
    subcategory: 'Headphones'
  },

  // Fashion - Women's Fashion
  {
    title: 'Designer Silk Blouse',
    description: 'Elegant silk blouse perfect for professional and casual occasions. Made from 100% pure silk.',
    shortDescription: 'Elegant silk blouse for professional wear',
    price: 89.99,
    originalPrice: 129.99,
    discount: 31,
    brand: 'Fashion Forward',
    model: 'Silk Blouse Classic',
    sku: 'FF-SILK-BLOUSE-BLK',
    images: [
      { url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500', alt: 'Designer Silk Blouse', isPrimary: true }
    ],
    specifications: [
      { name: 'Material', value: '100% Pure Silk' },
      { name: 'Care Instructions', value: 'Dry clean only' },
      { name: 'Fit', value: 'Regular fit' },
      { name: 'Sizes', value: 'XS, S, M, L, XL' }
    ],
    features: ['100% pure silk', 'Professional styling', 'Machine washable', 'Wrinkle resistant', 'Breathable fabric'],
    dimensions: { length: 26, width: 20, height: 1, weight: 0.3, unit: 'in' },
    inventory: { quantity: 100, lowStockThreshold: 20 },
    shipping: { weight: 0.3, freeShipping: true, estimatedDelivery: { min: 2, max: 4 } },
    ratings: { average: 4.5, count: 340 },
    tags: ['blouse', 'silk', 'professional', 'women', 'elegant'],
    isFeatured: false,
    subcategory: 'Tops'
  },

  // Fashion - Men's Fashion
  {
    title: 'Premium Cotton Dress Shirt',
    description: 'Classic dress shirt made from premium Egyptian cotton. Perfect for business and formal occasions.',
    shortDescription: 'Premium Egyptian cotton dress shirt',
    price: 79.99,
    originalPrice: 99.99,
    discount: 20,
    brand: 'Gentleman\'s Choice',
    model: 'Dress Shirt Premium',
    sku: 'GC-DRESS-SHIRT-WHT',
    images: [
      { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500', alt: 'Premium Cotton Dress Shirt', isPrimary: true }
    ],
    specifications: [
      { name: 'Material', value: '100% Egyptian Cotton' },
      { name: 'Care Instructions', value: 'Machine washable' },
      { name: 'Fit', value: 'Slim fit' },
      { name: 'Sizes', value: 'S, M, L, XL, XXL' }
    ],
    features: ['Egyptian cotton', 'Non-iron finish', 'Mother-of-pearl buttons', 'Split yoke', 'Single needle stitching'],
    dimensions: { length: 30, width: 24, height: 1, weight: 0.4, unit: 'in' },
    inventory: { quantity: 80, lowStockThreshold: 15 },
    shipping: { weight: 0.4, freeShipping: true, estimatedDelivery: { min: 2, max: 4 } },
    ratings: { average: 4.4, count: 280 },
    tags: ['dress shirt', 'cotton', 'business', 'men', 'formal'],
    isFeatured: false,
    subcategory: 'Shirts'
  },

  // Home & Garden - Furniture
  {
    title: 'Modern Sectional Sofa',
    description: 'Contemporary 3-piece sectional sofa with premium fabric upholstery and comfortable seating for 6 people.',
    shortDescription: 'Modern 3-piece sectional sofa with premium fabric',
    price: 1299.99,
    originalPrice: 1599.99,
    discount: 19,
    brand: 'Comfort Living',
    model: 'Sectional Modern',
    sku: 'CL-SECTIONAL-3PC',
    images: [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', alt: 'Modern Sectional Sofa', isPrimary: true }
    ],
    specifications: [
      { name: 'Material', value: 'Premium Fabric Upholstery' },
      { name: 'Seating Capacity', value: '6 people' },
      { name: 'Assembly', value: 'Required' },
      { name: 'Warranty', value: '2 years' }
    ],
    features: ['Premium fabric upholstery', 'Reversible chaise', 'Removable cushions', 'Stain resistant', 'Easy assembly'],
    dimensions: { length: 120, width: 84, height: 34, weight: 180, unit: 'in' },
    inventory: { quantity: 15, lowStockThreshold: 3 },
    shipping: { weight: 180, freeShipping: true, estimatedDelivery: { min: 5, max: 10 } },
    ratings: { average: 4.3, count: 95 },
    tags: ['sofa', 'sectional', 'furniture', 'living room', 'modern'],
    isFeatured: true,
    subcategory: 'Living Room'
  },

  // Sports & Outdoors - Fitness
  {
    title: 'Adjustable Dumbbell Set',
    description: 'Space-saving adjustable dumbbells with weight range from 5-50 lbs per dumbbell. Perfect for home gym.',
    shortDescription: 'Adjustable dumbbells 5-50 lbs per dumbbell',
    price: 299.99,
    originalPrice: 399.99,
    discount: 25,
    brand: 'FitLife',
    model: 'Adjustable Dumbbells',
    sku: 'FL-ADJ-DUMBBELL-50',
    images: [
      { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500', alt: 'Adjustable Dumbbell Set', isPrimary: true }
    ],
    specifications: [
      { name: 'Weight Range', value: '5-50 lbs per dumbbell' },
      { name: 'Material', value: 'Cast iron plates' },
      { name: 'Grip', value: 'Ergonomic rubber grip' },
      { name: 'Storage', value: 'Compact design' }
    ],
    features: ['Space-saving design', 'Quick weight adjustment', 'Ergonomic grips', 'Durable construction', 'Compact storage'],
    dimensions: { length: 15, width: 8, height: 8, weight: 50, unit: 'in' },
    inventory: { quantity: 30, lowStockThreshold: 5 },
    shipping: { weight: 50, freeShipping: true, estimatedDelivery: { min: 3, max: 7 } },
    ratings: { average: 4.7, count: 420 },
    tags: ['dumbbells', 'fitness', 'home gym', 'adjustable', 'weights'],
    isFeatured: true,
    subcategory: 'Strength Training'
  },

  // Books & Media - Books
  {
    title: 'The Psychology of Money',
    description: 'Timeless lessons on wealth, greed, and happiness by Morgan Housel. A must-read for financial wisdom.',
    shortDescription: 'Financial wisdom and timeless money lessons',
    price: 16.99,
    originalPrice: 19.99,
    discount: 15,
    brand: 'Harriman House',
    model: 'Paperback',
    sku: 'BOOK-PSYCH-MONEY',
    images: [
      { url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500', alt: 'The Psychology of Money Book', isPrimary: true }
    ],
    specifications: [
      { name: 'Format', value: 'Paperback' },
      { name: 'Pages', value: '256 pages' },
      { name: 'Language', value: 'English' },
      { name: 'Publisher', value: 'Harriman House' }
    ],
    features: ['Bestseller', 'Financial wisdom', 'Easy to read', 'Practical advice', 'Timeless lessons'],
    dimensions: { length: 8.5, width: 5.5, height: 0.8, weight: 0.5, unit: 'in' },
    inventory: { quantity: 200, lowStockThreshold: 50 },
    shipping: { weight: 0.5, freeShipping: true, estimatedDelivery: { min: 2, max: 5 } },
    ratings: { average: 4.8, count: 1850 },
    tags: ['book', 'finance', 'psychology', 'money', 'bestseller'],
    isFeatured: true,
    subcategory: 'Business & Finance'
  },

  // Health & Beauty - Beauty
  {
    title: 'Vitamin C Serum',
    description: 'Brightening vitamin C serum with hyaluronic acid. Reduces fine lines and improves skin texture.',
    shortDescription: 'Brightening vitamin C serum with hyaluronic acid',
    price: 29.99,
    originalPrice: 39.99,
    discount: 25,
    brand: 'Glow Beauty',
    model: 'Vitamin C Serum',
    sku: 'GB-VITC-SERUM-30ML',
    images: [
      { url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500', alt: 'Vitamin C Serum', isPrimary: true }
    ],
    specifications: [
      { name: 'Volume', value: '30ml' },
      { name: 'Active Ingredient', value: '20% Vitamin C' },
      { name: 'Skin Type', value: 'All skin types' },
      { name: 'Cruelty Free', value: 'Yes' }
    ],
    features: ['20% Vitamin C', 'Hyaluronic acid', 'Brightening effect', 'Anti-aging', 'Cruelty-free'],
    dimensions: { length: 3, width: 1.5, height: 6, weight: 0.1, unit: 'in' },
    inventory: { quantity: 150, lowStockThreshold: 30 },
    shipping: { weight: 0.1, freeShipping: true, estimatedDelivery: { min: 1, max: 3 } },
    ratings: { average: 4.6, count: 680 },
    tags: ['skincare', 'vitamin c', 'serum', 'anti-aging', 'beauty'],
    isFeatured: false,
    subcategory: 'Skincare'
  },

  // Automotive
  {
    title: 'Car Phone Mount',
    description: 'Universal car phone mount with magnetic attachment and 360-degree rotation. Compatible with all smartphones.',
    shortDescription: 'Universal magnetic car phone mount',
    price: 24.99,
    originalPrice: 34.99,
    discount: 29,
    brand: 'AutoTech',
    model: 'Magnetic Mount Pro',
    sku: 'AT-MAG-MOUNT-PRO',
    images: [
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', alt: 'Car Phone Mount', isPrimary: true }
    ],
    specifications: [
      { name: 'Compatibility', value: 'Universal smartphone' },
      { name: 'Mount Type', value: 'Magnetic' },
      { name: 'Rotation', value: '360 degrees' },
      { name: 'Installation', value: 'Dashboard or vent' }
    ],
    features: ['Universal compatibility', 'Strong magnetic hold', '360-degree rotation', 'Easy installation', 'Stable grip'],
    dimensions: { length: 4, width: 3, height: 2, weight: 0.2, unit: 'in' },
    inventory: { quantity: 80, lowStockThreshold: 15 },
    shipping: { weight: 0.2, freeShipping: true, estimatedDelivery: { min: 1, max: 3 } },
    ratings: { average: 4.4, count: 320 },
    tags: ['car mount', 'phone holder', 'magnetic', 'automotive', 'accessories'],
    isFeatured: false,
    subcategory: 'Car Accessories'
  },

  // Toys & Games
  {
    title: 'LEGO Creator Expert Set',
    description: 'Build and display this detailed LEGO Creator Expert set. Perfect for adult builders and collectors.',
    shortDescription: 'Detailed LEGO Creator Expert building set',
    price: 149.99,
    originalPrice: 179.99,
    discount: 17,
    brand: 'LEGO',
    model: 'Creator Expert',
    sku: 'LEGO-CREATOR-EXPERT',
    images: [
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', alt: 'LEGO Creator Expert Set', isPrimary: true }
    ],
    specifications: [
      { name: 'Pieces', value: '2,500+ pieces' },
      { name: 'Age Range', value: '18+' },
      { name: 'Difficulty', value: 'Expert' },
      { name: 'Display Size', value: '12" x 8" x 6"' }
    ],
    features: ['2500+ pieces', 'Expert level', 'Display model', 'Collectible', 'Detailed instructions'],
    dimensions: { length: 15, width: 10, height: 3, weight: 2.5, unit: 'in' },
    inventory: { quantity: 25, lowStockThreshold: 5 },
    shipping: { weight: 2.5, freeShipping: true, estimatedDelivery: { min: 2, max: 5 } },
    ratings: { average: 4.9, count: 180 },
    tags: ['lego', 'building', 'collectible', 'adult', 'expert'],
    isFeatured: true,
    subcategory: 'Building Sets'
  },

  // Pet Supplies
  {
    title: 'Premium Dog Food',
    description: 'High-quality dry dog food made with real meat and vegetables. Suitable for all adult dog breeds.',
    shortDescription: 'High-quality dry dog food with real meat',
    price: 49.99,
    originalPrice: 59.99,
    discount: 17,
    brand: 'PetCare Pro',
    model: 'Adult Dog Food',
    sku: 'PCP-DOG-FOOD-30LB',
    images: [
      { url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500', alt: 'Premium Dog Food', isPrimary: true }
    ],
    specifications: [
      { name: 'Weight', value: '30 lbs' },
      { name: 'Life Stage', value: 'Adult dogs' },
      { name: 'Protein Source', value: 'Real chicken' },
      { name: 'Grain Free', value: 'No' }
    ],
    features: ['Real meat first', 'No artificial preservatives', 'Complete nutrition', 'Digestive health', 'Shiny coat'],
    dimensions: { length: 20, width: 12, height: 4, weight: 30, unit: 'in' },
    inventory: { quantity: 40, lowStockThreshold: 10 },
    shipping: { weight: 30, freeShipping: true, estimatedDelivery: { min: 2, max: 5 } },
    ratings: { average: 4.5, count: 290 },
    tags: ['dog food', 'pet supplies', 'nutrition', 'adult dogs', 'premium'],
    isFeatured: false,
    subcategory: 'Dog Food'
  },

  // Grocery & Gourmet
  {
    title: 'Organic Extra Virgin Olive Oil',
    description: 'Premium organic extra virgin olive oil from Mediterranean olives. Cold-pressed and unfiltered.',
    shortDescription: 'Premium organic extra virgin olive oil',
    price: 19.99,
    originalPrice: 24.99,
    discount: 20,
    brand: 'Mediterranean Gold',
    model: 'Extra Virgin Olive Oil',
    sku: 'MG-EVOO-500ML',
    images: [
      { url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500', alt: 'Organic Extra Virgin Olive Oil', isPrimary: true }
    ],
    specifications: [
      { name: 'Volume', value: '500ml' },
      { name: 'Type', value: 'Extra Virgin' },
      { name: 'Origin', value: 'Mediterranean' },
      { name: 'Certification', value: 'Organic' }
    ],
    features: ['Organic certified', 'Cold-pressed', 'Unfiltered', 'Mediterranean olives', 'Rich flavor'],
    dimensions: { length: 3, width: 3, height: 8, weight: 1.1, unit: 'in' },
    inventory: { quantity: 120, lowStockThreshold: 25 },
    shipping: { weight: 1.1, freeShipping: true, estimatedDelivery: { min: 2, max: 4 } },
    ratings: { average: 4.7, count: 450 },
    tags: ['olive oil', 'organic', 'extra virgin', 'cooking', 'gourmet'],
    isFeatured: false,
    subcategory: 'Cooking Oils'
  }
];

async function seedProducts() {
  try {
    console.log('🌱 Starting product seeding...');
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('✅ Cleared existing products');

    // Get all categories for reference
    const categories = await Category.find({});
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Create products
    for (const productData of productsData) {
      // Find the appropriate category
      let categoryId = null;
      
      // Map subcategories to main categories
      const subcategoryMap = {
        'Smartphones': 'Electronics',
        'Laptops': 'Computers & Tablets',
        'Tablets': 'Computers & Tablets',
        'Headphones': 'Audio & Headphones',
        'Tops': "Women's Fashion",
        'Shirts': "Men's Fashion",
        'Living Room': 'Furniture',
        'Strength Training': 'Fitness & Exercise',
        'Business & Finance': 'Books',
        'Skincare': 'Beauty & Personal Care',
        'Car Accessories': 'Automotive',
        'Building Sets': 'Toys & Games',
        'Dog Food': 'Pet Supplies',
        'Cooking Oils': 'Grocery & Gourmet'
      };

      const mainCategory = subcategoryMap[productData.subcategory] || productData.subcategory;
      categoryId = categoryMap[mainCategory];

      if (!categoryId) {
        console.log(`⚠️  Category not found for: ${productData.subcategory}, using Electronics as default`);
        categoryId = categoryMap['Electronics'];
      }

      const product = new Product({
        ...productData,
        category: categoryId
      });

      await product.save();
      console.log(`✅ Created product: ${productData.title}`);
    }

    const totalProducts = await Product.countDocuments();
    console.log(`🎉 Successfully seeded ${totalProducts} products!`);
    
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeder
seedProducts();

