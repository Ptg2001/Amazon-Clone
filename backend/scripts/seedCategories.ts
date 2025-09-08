// @ts-nocheck
export {};
const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/amazon-clone', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const categories = [
  // Electronics & Technology
  {
    name: 'Electronics',
    description: 'All electronic devices and gadgets',
    icon: 'electronics',
    sortOrder: 1,
    seo: {
      metaTitle: 'Electronics - Latest Tech Gadgets',
      metaDescription: 'Shop the latest electronics including smartphones, laptops, tablets, and more',
      keywords: ['electronics', 'gadgets', 'technology', 'smartphones', 'laptops']
    }
  },
  {
    name: 'Computers & Tablets',
    description: 'Laptops, desktops, tablets and accessories',
    parent: null, // Will be set after Electronics is created
    icon: 'computer',
    sortOrder: 2,
    seo: {
      metaTitle: 'Computers & Tablets - Laptops, Desktops, Tablets',
      metaDescription: 'Find the perfect computer or tablet for your needs',
      keywords: ['laptops', 'desktops', 'tablets', 'computers', 'macbook', 'ipad']
    }
  },
  {
    name: 'Smartphones & Accessories',
    description: 'Mobile phones and accessories',
    parent: null, // Will be set after Electronics is created
    icon: 'smartphone',
    sortOrder: 3,
    seo: {
      metaTitle: 'Smartphones & Accessories - Latest Mobile Phones',
      metaDescription: 'Shop the latest smartphones and mobile accessories',
      keywords: ['smartphones', 'iphone', 'android', 'mobile', 'phone cases']
    }
  },
  {
    name: 'Audio & Headphones',
    description: 'Headphones, speakers, and audio equipment',
    parent: null, // Will be set after Electronics is created
    icon: 'headphones',
    sortOrder: 4,
    seo: {
      metaTitle: 'Audio & Headphones - Premium Sound Equipment',
      metaDescription: 'High-quality headphones, speakers, and audio equipment',
      keywords: ['headphones', 'speakers', 'audio', 'wireless', 'bluetooth']
    }
  },
  {
    name: 'Cameras & Photography',
    description: 'Digital cameras, lenses, and photography equipment',
    parent: null, // Will be set after Electronics is created
    icon: 'camera',
    sortOrder: 5,
    seo: {
      metaTitle: 'Cameras & Photography - Professional Camera Equipment',
      metaDescription: 'Professional cameras, lenses, and photography accessories',
      keywords: ['cameras', 'photography', 'lenses', 'dslr', 'mirrorless']
    }
  },

  // Fashion & Clothing
  {
    name: 'Fashion',
    description: 'Clothing, shoes, and accessories for men, women, and kids',
    icon: 'fashion',
    sortOrder: 6,
    seo: {
      metaTitle: 'Fashion - Clothing, Shoes & Accessories',
      metaDescription: 'Shop the latest fashion trends for men, women, and kids',
      keywords: ['fashion', 'clothing', 'shoes', 'accessories', 'style']
    }
  },
  {
    name: "Women's Fashion",
    description: 'Clothing, shoes, and accessories for women',
    parent: null, // Will be set after Fashion is created
    icon: 'women-fashion',
    sortOrder: 7,
    seo: {
      metaTitle: "Women's Fashion - Clothing, Shoes & Accessories",
      metaDescription: 'Discover the latest women\'s fashion trends and styles',
      keywords: ['womens clothing', 'womens shoes', 'womens accessories', 'dresses', 'tops']
    }
  },
  {
    name: "Men's Fashion",
    description: 'Clothing, shoes, and accessories for men',
    parent: null, // Will be set after Fashion is created
    icon: 'men-fashion',
    sortOrder: 8,
    seo: {
      metaTitle: "Men's Fashion - Clothing, Shoes & Accessories",
      metaDescription: 'Shop the latest men\'s fashion and style essentials',
      keywords: ['mens clothing', 'mens shoes', 'mens accessories', 'shirts', 'pants']
    }
  },
  {
    name: "Kids' Fashion",
    description: 'Clothing, shoes, and accessories for children',
    parent: null, // Will be set after Fashion is created
    icon: 'kids-fashion',
    sortOrder: 9,
    seo: {
      metaTitle: "Kids' Fashion - Children's Clothing & Accessories",
      metaDescription: 'Cute and comfortable clothing for kids of all ages',
      keywords: ['kids clothing', 'childrens clothes', 'kids shoes', 'baby clothes']
    }
  },

  // Home & Garden
  {
    name: 'Home & Garden',
    description: 'Furniture, home decor, and garden supplies',
    icon: 'home-garden',
    sortOrder: 10,
    seo: {
      metaTitle: 'Home & Garden - Furniture, Decor & Garden Supplies',
      metaDescription: 'Transform your home and garden with our selection of furniture and decor',
      keywords: ['home', 'garden', 'furniture', 'decor', 'outdoor']
    }
  },
  {
    name: 'Furniture',
    description: 'Home and office furniture',
    parent: null, // Will be set after Home & Garden is created
    icon: 'furniture',
    sortOrder: 11,
    seo: {
      metaTitle: 'Furniture - Home & Office Furniture',
      metaDescription: 'Quality furniture for every room in your home and office',
      keywords: ['furniture', 'sofa', 'bed', 'table', 'chair', 'office furniture']
    }
  },
  {
    name: 'Home Decor',
    description: 'Decorative items for your home',
    parent: null, // Will be set after Home & Garden is created
    icon: 'home-decor',
    sortOrder: 12,
    seo: {
      metaTitle: 'Home Decor - Decorative Items & Accessories',
      metaDescription: 'Beautiful home decor items to personalize your space',
      keywords: ['home decor', 'decorative', 'wall art', 'candles', 'vases']
    }
  },
  {
    name: 'Garden & Outdoor',
    description: 'Garden tools, plants, and outdoor furniture',
    parent: null, // Will be set after Home & Garden is created
    icon: 'garden',
    sortOrder: 13,
    seo: {
      metaTitle: 'Garden & Outdoor - Tools, Plants & Outdoor Furniture',
      metaDescription: 'Everything you need for your garden and outdoor spaces',
      keywords: ['garden', 'outdoor', 'plants', 'tools', 'patio furniture']
    }
  },

  // Sports & Outdoors
  {
    name: 'Sports & Outdoors',
    description: 'Sports equipment, outdoor gear, and fitness',
    icon: 'sports',
    sortOrder: 14,
    seo: {
      metaTitle: 'Sports & Outdoors - Equipment, Gear & Fitness',
      metaDescription: 'Sports equipment, outdoor gear, and fitness accessories',
      keywords: ['sports', 'outdoor', 'fitness', 'exercise', 'camping']
    }
  },
  {
    name: 'Fitness & Exercise',
    description: 'Exercise equipment and fitness accessories',
    parent: null, // Will be set after Sports & Outdoors is created
    icon: 'fitness',
    sortOrder: 15,
    seo: {
      metaTitle: 'Fitness & Exercise - Equipment & Accessories',
      metaDescription: 'Get fit with our selection of exercise equipment and accessories',
      keywords: ['fitness', 'exercise', 'gym', 'weights', 'yoga']
    }
  },
  {
    name: 'Outdoor Recreation',
    description: 'Camping, hiking, and outdoor adventure gear',
    parent: null, // Will be set after Sports & Outdoors is created
    icon: 'outdoor',
    sortOrder: 16,
    seo: {
      metaTitle: 'Outdoor Recreation - Camping & Hiking Gear',
      metaDescription: 'Gear up for outdoor adventures with camping and hiking equipment',
      keywords: ['camping', 'hiking', 'outdoor', 'backpack', 'tent']
    }
  },

  // Books & Media
  {
    name: 'Books & Media',
    description: 'Books, movies, music, and educational materials',
    icon: 'books',
    sortOrder: 17,
    seo: {
      metaTitle: 'Books & Media - Books, Movies & Music',
      metaDescription: 'Discover books, movies, music, and educational materials',
      keywords: ['books', 'movies', 'music', 'education', 'media']
    }
  },
  {
    name: 'Books',
    description: 'Fiction, non-fiction, and educational books',
    parent: null, // Will be set after Books & Media is created
    icon: 'book',
    sortOrder: 18,
    seo: {
      metaTitle: 'Books - Fiction, Non-fiction & Educational',
      metaDescription: 'Browse our extensive collection of books for all ages',
      keywords: ['books', 'fiction', 'non-fiction', 'education', 'novels']
    }
  },
  {
    name: 'Movies & TV',
    description: 'DVDs, Blu-rays, and streaming media',
    parent: null, // Will be set after Books & Media is created
    icon: 'movie',
    sortOrder: 19,
    seo: {
      metaTitle: 'Movies & TV - DVDs, Blu-rays & Streaming',
      metaDescription: 'Watch your favorite movies and TV shows',
      keywords: ['movies', 'tv shows', 'dvd', 'blu-ray', 'streaming']
    }
  },

  // Health & Beauty
  {
    name: 'Health & Beauty',
    description: 'Health products, beauty items, and personal care',
    icon: 'health-beauty',
    sortOrder: 20,
    seo: {
      metaTitle: 'Health & Beauty - Personal Care & Wellness',
      metaDescription: 'Health and beauty products for personal care and wellness',
      keywords: ['health', 'beauty', 'personal care', 'wellness', 'skincare']
    }
  },
  {
    name: 'Beauty & Personal Care',
    description: 'Skincare, makeup, and personal hygiene products',
    parent: null, // Will be set after Health & Beauty is created
    icon: 'beauty',
    sortOrder: 21,
    seo: {
      metaTitle: 'Beauty & Personal Care - Skincare & Makeup',
      metaDescription: 'Enhance your beauty with our skincare and makeup products',
      keywords: ['beauty', 'skincare', 'makeup', 'personal care', 'cosmetics']
    }
  },
  {
    name: 'Health & Wellness',
    description: 'Health supplements, medical devices, and wellness products',
    parent: null, // Will be set after Health & Beauty is created
    icon: 'health',
    sortOrder: 22,
    seo: {
      metaTitle: 'Health & Wellness - Supplements & Medical Devices',
      metaDescription: 'Support your health and wellness with our products',
      keywords: ['health', 'wellness', 'supplements', 'medical', 'vitamins']
    }
  },

  // Automotive
  {
    name: 'Automotive',
    description: 'Car parts, accessories, and automotive tools',
    icon: 'automotive',
    sortOrder: 23,
    seo: {
      metaTitle: 'Automotive - Car Parts, Accessories & Tools',
      metaDescription: 'Everything you need for your vehicle maintenance and upgrades',
      keywords: ['automotive', 'car parts', 'accessories', 'tools', 'vehicle']
    }
  },

  // Toys & Games
  {
    name: 'Toys & Games',
    description: 'Toys, games, and entertainment for all ages',
    icon: 'toys',
    sortOrder: 24,
    seo: {
      metaTitle: 'Toys & Games - Fun for All Ages',
      metaDescription: 'Discover toys and games for children and adults',
      keywords: ['toys', 'games', 'children', 'board games', 'video games']
    }
  },

  // Pet Supplies
  {
    name: 'Pet Supplies',
    description: 'Food, toys, and accessories for pets',
    icon: 'pets',
    sortOrder: 25,
    seo: {
      metaTitle: 'Pet Supplies - Food, Toys & Accessories',
      metaDescription: 'Everything your pet needs for a happy and healthy life',
      keywords: ['pet supplies', 'dog food', 'cat food', 'pet toys', 'pet accessories']
    }
  },

  // Grocery & Gourmet
  {
    name: 'Grocery & Gourmet',
    description: 'Food, beverages, and gourmet items',
    icon: 'grocery',
    sortOrder: 26,
    seo: {
      metaTitle: 'Grocery & Gourmet - Food & Beverages',
      metaDescription: 'Shop for groceries, gourmet foods, and beverages',
      keywords: ['grocery', 'food', 'beverages', 'gourmet', 'organic']
    }
  }
];

async function seedCategories() {
  try {
    console.log('🌱 Starting category seeding...');
    
    // Clear existing categories
    await Category.deleteMany({});
    console.log('✅ Cleared existing categories');

    // Create categories in order
    const createdCategories = {};
    
    for (const categoryData of categories) {
      const category = new Category(categoryData);
      await category.save();
      createdCategories[categoryData.name] = category._id;
      console.log(`✅ Created category: ${categoryData.name}`);
    }

    // Update parent references
    const electronicsId = createdCategories['Electronics'];
    const fashionId = createdCategories['Fashion'];
    const homeGardenId = createdCategories['Home & Garden'];
    const sportsId = createdCategories['Sports & Outdoors'];
    const booksMediaId = createdCategories['Books & Media'];
    const healthBeautyId = createdCategories['Health & Beauty'];

    // Update Electronics subcategories
    await Category.updateOne(
      { name: 'Computers & Tablets' },
      { parent: electronicsId }
    );
    await Category.updateOne(
      { name: 'Smartphones & Accessories' },
      { parent: electronicsId }
    );
    await Category.updateOne(
      { name: 'Audio & Headphones' },
      { parent: electronicsId }
    );
    await Category.updateOne(
      { name: 'Cameras & Photography' },
      { parent: electronicsId }
    );

    // Update Fashion subcategories
    await Category.updateOne(
      { name: "Women's Fashion" },
      { parent: fashionId }
    );
    await Category.updateOne(
      { name: "Men's Fashion" },
      { parent: fashionId }
    );
    await Category.updateOne(
      { name: "Kids' Fashion" },
      { parent: fashionId }
    );

    // Update Home & Garden subcategories
    await Category.updateOne(
      { name: 'Furniture' },
      { parent: homeGardenId }
    );
    await Category.updateOne(
      { name: 'Home Decor' },
      { parent: homeGardenId }
    );
    await Category.updateOne(
      { name: 'Garden & Outdoor' },
      { parent: homeGardenId }
    );

    // Update Sports & Outdoors subcategories
    await Category.updateOne(
      { name: 'Fitness & Exercise' },
      { parent: sportsId }
    );
    await Category.updateOne(
      { name: 'Outdoor Recreation' },
      { parent: sportsId }
    );

    // Update Books & Media subcategories
    await Category.updateOne(
      { name: 'Books' },
      { parent: booksMediaId }
    );
    await Category.updateOne(
      { name: 'Movies & TV' },
      { parent: booksMediaId }
    );

    // Update Health & Beauty subcategories
    await Category.updateOne(
      { name: 'Beauty & Personal Care' },
      { parent: healthBeautyId }
    );
    await Category.updateOne(
      { name: 'Health & Wellness' },
      { parent: healthBeautyId }
    );

    console.log('✅ Updated parent references');

    const totalCategories = await Category.countDocuments();
    console.log(`🎉 Successfully seeded ${totalCategories} categories!`);
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeder
seedCategories();

