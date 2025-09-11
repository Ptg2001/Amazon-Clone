const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import route handlers from compiled backend (built during Netlify build)
// Import compiled routes using static paths so the bundler can track them
const authRoutes = require('./backend-dist/routes/auth.js');
const userRoutes = require('./backend-dist/routes/users.js');
const productRoutes = require('./backend-dist/routes/products.js');
const categoryRoutes = require('./backend-dist/routes/categories.js');
const orderRoutes = require('./backend-dist/routes/orders.js');
const paymentRoutes = require('./backend-dist/routes/payments.js');
const adminRoutes = require('./backend-dist/routes/admin.js');
const cartRoutes = require('./backend-dist/routes/cart.js');
const chatRoutes = require('./backend-dist/routes/chat.js');

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

// Routes (Netlify redirect already sends /api/* to this function)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
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
