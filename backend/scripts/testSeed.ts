// @ts-nocheck
export {};
const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('../models/Category');
const Product = require('../models/Product');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/amazon-clone', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testSeed() {
  try {
    console.log('🧪 Testing database seeding...');
    
    // Test category count
    const categoryCount = await Category.countDocuments();
    console.log(`📁 Categories in database: ${categoryCount}`);
    
    // Test product count
    const productCount = await Product.countDocuments();
    console.log(`📦 Products in database: ${productCount}`);
    
    if (categoryCount === 0 && productCount === 0) {
      console.log('⚠️  Database is empty. Run "npm run seed" to populate it.');
    } else {
      console.log('✅ Database has data!');
      
      // Show some sample categories
      const categories = await Category.find({}).limit(5);
      console.log('\n📁 Sample Categories:');
      categories.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.level === 0 ? 'Main' : 'Sub'})`);
      });
      
      // Show some sample products
      const products = await Product.find({}).limit(5);
      console.log('\n📦 Sample Products:');
      products.forEach(product => {
        console.log(`  - ${product.title} - $${product.price}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing seed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testSeed();

