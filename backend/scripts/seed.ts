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

async function seedDatabase() {
  try {
    console.log('🚀 Starting database seeding...');
    console.log('📊 This will populate your MongoDB Atlas database with categories and products');
    console.log('⚠️  WARNING: This will clear existing data!');
    
    // Clear existing data
    console.log('\n🧹 Clearing existing data...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('✅ Cleared existing data');

    // Import and run category seeder
    console.log('\n📁 Seeding categories...');
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    try {
      await execAsync('node scripts/seedCategories.js');
      console.log('✅ Categories seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding categories:', error.message);
      throw error;
    }

    // Import and run product seeder
    console.log('\n📦 Seeding products...');
    try {
      await execAsync('node scripts/seedProducts.js');
      console.log('✅ Products seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding products:', error.message);
      throw error;
    }

    // Display summary
    console.log('\n📈 Seeding Summary:');
    const categoryCount = await Category.countDocuments();
    const productCount = await Product.countDocuments();
    
    console.log(`📁 Categories created: ${categoryCount}`);
    console.log(`📦 Products created: ${productCount}`);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('🌐 Your Amazon clone is now ready with sample data');
    console.log('💡 You can now start your server and explore the products');
    
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the seeder
seedDatabase();

