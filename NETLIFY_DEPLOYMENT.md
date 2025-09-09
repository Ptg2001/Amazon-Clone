# Netlify Deployment Guide

This guide will help you deploy your AmazonVirtua frontend to Netlify.

## Prerequisites

- GitHub repository with your code
- Netlify account
- Backend API deployed (Heroku, Railway, or similar)

## Step 1: Prepare Your Repository

1. **Ensure your code is pushed to GitHub**
2. **Create environment files** (if not already created):
   - `frontend/.env.example` - Template for environment variables
   - `backend/.env.example` - Template for backend environment variables

## Step 2: Deploy to Netlify

### Option A: Deploy via Netlify Dashboard

1. **Go to [Netlify](https://netlify.com) and sign in**
2. **Click "New site from Git"**
3. **Connect your GitHub repository**
4. **Configure build settings:**
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** `18` (or latest LTS)

### Option B: Deploy via netlify.toml (Recommended)

The project already includes a `netlify.toml` file with the correct configuration. Simply connect your repository to Netlify and it will automatically use these settings.

## Step 3: Configure Environment Variables

In your Netlify dashboard, go to **Site settings > Environment variables** and add:

### Required Environment Variables:

```env
VITE_API_URL=https://your-backend-api.herokuapp.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_APP_NAME=AmazonVirtua
VITE_NODE_ENV=production
```

### Optional Environment Variables:

```env
VITE_APP_VERSION=1.0.0
```

## Step 4: Configure Redirects

The `netlify.toml` file already includes redirect rules for SPA routing:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

This ensures that all routes are handled by your React application.

## Step 5: Deploy

1. **Trigger a new deploy** by pushing to your main branch
2. **Monitor the build logs** in Netlify dashboard
3. **Test your deployed application**

## Step 6: Custom Domain (Optional)

1. **Go to Site settings > Domain management**
2. **Add your custom domain**
3. **Configure DNS settings** as instructed by Netlify
4. **Enable HTTPS** (automatic with Netlify)

## Environment Variables Reference

### Frontend (.env for development)

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# App Configuration
VITE_APP_NAME=AmazonVirtua
VITE_APP_VERSION=1.0.0

# Environment
VITE_NODE_ENV=development
```

### Backend (.env for development)

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/amazon-clone

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:3000

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

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
```

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json
- Check build logs for specific errors

### API Connection Issues
- Verify `VITE_API_URL` points to your deployed backend
- Check CORS settings on your backend
- Ensure backend is accessible from the internet

### Environment Variables Not Working
- Ensure variables are prefixed with `VITE_`
- Redeploy after adding new environment variables
- Check variable names match exactly (case-sensitive)

### Routing Issues
- Verify redirect rules in netlify.toml
- Check that all routes return index.html
- Test direct URL access

## Performance Optimization

1. **Enable Netlify's CDN** (automatic)
2. **Use Netlify's image optimization**
3. **Enable gzip compression** (automatic)
4. **Set up form handling** if needed
5. **Configure caching headers** in netlify.toml

## Security Considerations

1. **Never commit .env files** to version control
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** (automatic with Netlify)
4. **Set up security headers** in netlify.toml if needed

## Support

For issues with this deployment guide, check:
- [Netlify Documentation](https://docs.netlify.com/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
