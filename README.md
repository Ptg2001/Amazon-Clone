# Amazon Clone - MERN Stack E-commerce Application

A full-stack Amazon clone built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring a modern, responsive design and comprehensive e-commerce functionality.

## 🚀 Features

### Frontend Features
- **Modern React UI** with Tailwind CSS styling
- **Responsive Design** that works on all devices
- **Product Catalog** with search, filtering, and pagination
- **Shopping Cart** with real-time updates
- **User Authentication** (login/register/profile management)
- **Order Management** with tracking
- **Wishlist** functionality
- **Admin Dashboard** for product and order management
- **Payment Integration** with Stripe
- **Image Optimization** with lazy loading
- **SEO Optimization** with React Helmet

### Backend Features
- **RESTful API** with Express.js
- **MongoDB** database with Mongoose ODM
- **JWT Authentication** with secure password hashing
- **File Upload** with Cloudinary integration
- **Email Services** with Nodemailer
- **Payment Processing** with Stripe
- **Order Management** with status tracking
- **Admin Panel** with comprehensive analytics
- **Data Validation** and error handling
- **Rate Limiting** and security middleware

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router DOM** - Client-side routing
- **Redux Toolkit** - State management
- **React Query** - Server state management
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Image storage
- **Stripe** - Payment processing
- **Nodemailer** - Email services

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- Cloudinary account (for image storage)
- Stripe account (for payments)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd amazon-clone-mern
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/amazon-clone
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   VITE_APP_NAME=AmazonVirtua
   VITE_NODE_ENV=development
   ```

3. **Start the frontend development server**
   ```bash
   npm start
   ```

### Quick Start (Both Servers)

From the root directory:
```bash
# Install all dependencies
npm run install-all

# Start both frontend and backend
npm run dev
```

## 🗄️ Database Schema

### User Model
- Personal information (name, email, phone)
- Authentication (password, JWT tokens)
- Addresses and payment methods
- Wishlist and order history
- User preferences

### Product Model
- Product details (title, description, price)
- Images and specifications
- Inventory management
- Reviews and ratings
- SEO optimization

### Category Model
- Hierarchical category structure
- SEO metadata
- Filter configurations

### Order Model
- Order information and status
- Payment details
- Shipping and tracking
- Timeline and history

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `GET /api/categories/:id/products` - Get category products

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update order status

### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment
- `POST /api/payments/confirm-payment` - Confirm payment
- `POST /api/payments/create-refund` - Create refund

## 🎨 UI Components

### Layout Components
- **Navbar** - Navigation with search and user menu
- **Footer** - Site footer with links
- **SearchBar** - Product search with suggestions
- **CartSidebar** - Shopping cart sidebar

### Product Components
- **ProductCard** - Product display card
- **ProductGrid** - Product listing grid
- **ProductDetails** - Detailed product view
- **ProductReviews** - Customer reviews

### Form Components
- **LoginForm** - User authentication
- **RegisterForm** - User registration
- **CheckoutForm** - Order checkout
- **AddressForm** - Address management

## 🔐 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** with bcrypt
- **Input Validation** and sanitization
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for secure cross-origin requests
- **Helmet.js** for security headers
- **XSS Protection** with input sanitization

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop** (1024px and above)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

## 🚀 Deployment

### Backend Deployment (Heroku)
1. Create a Heroku app
2. Set environment variables
3. Deploy with Git

### Frontend Deployment (Netlify)
1. Build the React app: `npm run build`
2. Deploy to Netlify:
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Configure environment variables in Netlify dashboard

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas cluster
2. Configure network access
3. Create database user
4. Update connection string

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📊 Admin Features

- **Dashboard** with analytics and statistics
- **Product Management** - Add, edit, delete products
- **Order Management** - View and update orders
- **User Management** - Manage user accounts
- **Category Management** - Organize product categories

## 🔄 State Management

### Redux Store
- **Auth Slice** - User authentication state
- **Cart Slice** - Shopping cart state
- **UI Slice** - UI state management

### React Query
- **Server State** - API data caching
- **Background Updates** - Automatic data refetching
- **Optimistic Updates** - Immediate UI updates

## 🎯 Performance Optimizations

- **Code Splitting** with React.lazy()
- **Image Lazy Loading** with react-lazy-load-image-component
- **Memoization** with React.memo()
- **Bundle Optimization** with webpack
- **CDN Integration** for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Amazon for design inspiration
- React and Node.js communities
- Open source contributors
- All the amazing libraries used in this project

## 📞 Support

For support, email support@amazon-clone.com or create an issue in the repository.

---

**Note**: This is a demo project for educational purposes. It is not affiliated with Amazon.com, Inc.
