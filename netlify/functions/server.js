const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import route handlers
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const cartRoutes = require('./routes/cart');

const app = express();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 300 : 2000,
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
let cachedConnection = null;
const connectToDatabase = async () => {
  if (!cachedConnection) {
    try {
      cachedConnection = await mongoose.connect(
        process.env.MONGODB_URI || 'mongodb://localhost:27017/amazon-clone',
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      );
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
  return cachedConnection;
};

// Routes
app.use('/.netlify/functions/server/api/auth', authRoutes);
app.use('/.netlify/functions/server/api/users', userRoutes);
app.use('/.netlify/functions/server/api/products', productRoutes);
app.use('/.netlify/functions/server/api/categories', categoryRoutes);
app.use('/.netlify/functions/server/api/orders', orderRoutes);
app.use('/.netlify/functions/server/api/payments', paymentRoutes);
app.use('/.netlify/functions/server/api/admin', adminRoutes);
app.use('/.netlify/functions/server/api/cart', cartRoutes);

// Health check
app.get('/.netlify/functions/server/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(), 
    uptime: process.uptime() 
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize database connection
connectToDatabase().catch(console.error);

// Export the serverless handler
module.exports.handler = serverless(app);
