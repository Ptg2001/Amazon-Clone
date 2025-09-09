# Full-Stack Netlify Deployment Guide

This guide will help you deploy your complete AmazonVirtua application (frontend + backend) on Netlify using serverless functions.

## 🏗️ Architecture Overview

- **Frontend**: React app deployed as static site
- **Backend**: Express.js API converted to Netlify Functions (serverless)
- **Database**: MongoDB Atlas (external)
- **File Storage**: Cloudinary (external)
- **Payments**: Stripe/Razorpay (external)

## 📋 Prerequisites

- GitHub repository with your code
- Netlify account
- MongoDB Atlas account
- Cloudinary account
- Stripe/Razorpay account

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

1. **Ensure all files are committed and pushed to GitHub**
2. **Verify the following structure exists:**
   ```
   ├── frontend/          # React app
   ├── netlify/
   │   └── functions/     # Serverless functions
   │       ├── server.js  # Main function handler
   │       ├── routes/    # API routes
   │       ├── models/    # Database models
   │       └── middleware/ # Middleware functions
   ├── netlify.toml       # Netlify configuration
   └── package.json       # Root package.json
   ```

### Step 2: Deploy to Netlify

1. **Go to [Netlify](https://netlify.com) and sign in**
2. **Click "New site from Git"**
3. **Connect your GitHub repository**
4. **Configure build settings:**
   - **Base directory:** `.` (root)
   - **Build command:** `npm run build:netlify`
   - **Publish directory:** `frontend/dist`
   - **Node version:** `18`

### Step 3: Configure Environment Variables

In your Netlify dashboard, go to **Site settings > Environment variables** and add:

#### Frontend Environment Variables:
```env
VITE_API_URL=/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_APP_NAME=AmazonVirtua
VITE_APP_VERSION=1.0.0
VITE_NODE_ENV=production
```

#### Backend Environment Variables:
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/amazon-clone

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=https://your-site-name.netlify.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM=AmazonVirtua <your-email@gmail.com>

# Server Configuration
NODE_ENV=production
```

### Step 4: Deploy

1. **Trigger a new deploy** by pushing to your main branch
2. **Monitor the build logs** in Netlify dashboard
3. **Test your deployed application**

## 🔧 Local Development with Netlify Functions

### Install Netlify CLI:
```bash
npm install -g netlify-cli
```

### Start local development:
```bash
npm run dev:netlify
```

This will:
- Start the frontend on `http://localhost:8888`
- Start Netlify Functions on `http://localhost:8888/.netlify/functions/`

## 📁 Project Structure

```
AmazonVirtua/
├── frontend/                 # React frontend
│   ├── src/
│   ├── package.json
│   └── .env.production      # Production environment variables
├── netlify/
│   └── functions/           # Serverless functions
│       ├── server.js        # Main Express app wrapped in serverless
│       ├── package.json     # Function dependencies
│       ├── routes/          # API routes (copied from backend)
│       ├── models/          # Database models (copied from backend)
│       └── middleware/      # Middleware (copied from backend)
├── backend/                 # Original backend (for local development)
├── netlify.toml            # Netlify configuration
└── package.json            # Root package.json
```

## 🔄 How It Works

1. **Frontend**: Built as static files and served from CDN
2. **API Routes**: All `/api/*` requests are redirected to `/.netlify/functions/server/api/*`
3. **Serverless Function**: Express app wrapped with `serverless-http`
4. **Database**: MongoDB Atlas connection (external)
5. **File Uploads**: Cloudinary integration (external)

## 🚨 Important Notes

### Function Timeout
- Netlify Functions have a 10-second timeout for the free tier
- 15-second timeout for Pro plans
- Consider optimizing long-running operations

### Cold Starts
- Functions may have cold start delays
- Consider using connection pooling for database connections

### File Uploads
- Large file uploads should go directly to Cloudinary
- Use signed upload URLs for security

## 🛠️ Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json files
- Check build logs for specific errors

### API Not Working
- Verify environment variables are set correctly
- Check function logs in Netlify dashboard
- Ensure MongoDB connection string is correct

### CORS Issues
- Verify `FRONTEND_URL` environment variable
- Check CORS configuration in server.js

### Database Connection Issues
- Verify MongoDB Atlas connection string
- Check network access settings in MongoDB Atlas
- Ensure database user has proper permissions

## 📊 Performance Optimization

1. **Enable Netlify's CDN** (automatic)
2. **Use connection pooling** for database connections
3. **Implement caching** for frequently accessed data
4. **Optimize images** with Cloudinary transformations
5. **Use Netlify's edge functions** for global performance

## 🔐 Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **HTTPS**: Automatic with Netlify
3. **CORS**: Properly configured for your domain
4. **Rate Limiting**: Implemented in serverless function
5. **Input Validation**: Use express-validator middleware

## 📈 Monitoring

1. **Netlify Analytics**: Built-in analytics
2. **Function Logs**: Available in Netlify dashboard
3. **Error Tracking**: Consider adding Sentry
4. **Performance Monitoring**: Use Netlify's performance insights

## 🔄 CI/CD

The deployment is automatic when you push to your main branch:
1. Netlify detects changes
2. Builds frontend and installs function dependencies
3. Deploys both frontend and functions
4. Updates environment variables if changed

## 💰 Cost Considerations

### Netlify Free Tier:
- 100GB bandwidth/month
- 300 build minutes/month
- 100GB function execution time/month

### Netlify Pro ($19/month):
- 1TB bandwidth/month
- 3,000 build minutes/month
- 1TB function execution time/month

## 🆘 Support

For issues with this deployment:
- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Serverless Express Documentation](https://github.com/vendia/serverless-express)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

## 🎉 Success!

Once deployed, your full-stack application will be available at:
- **Frontend**: `https://your-site-name.netlify.app`
- **API**: `https://your-site-name.netlify.app/api/*`

Both frontend and backend are now running on Netlify's global CDN with automatic scaling!
