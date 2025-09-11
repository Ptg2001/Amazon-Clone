// @ts-nocheck
export {};
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Product brand is required'],
    trim: true
  },
  // Optional structured fields commonly used on product PDP
  screenSize: { type: String },
  resolution: { type: String },
  aspectRatio: { type: String },
  screenSurface: { type: String },
  refreshRate: { type: String },
  panelType: { type: String },
  model: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    unique: true,
    required: [true, 'Product SKU is required'],
    uppercase: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  specifications: [{
    name: String,
    value: String
  }],
  features: [String],
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number,
    unit: {
      type: String,
      enum: ['in', 'cm', 'ft', 'm'],
      default: 'in'
    }
  },
  inventory: {
    quantity: {
      type: Number,
      required: [true, 'Inventory quantity is required'],
      min: [0, 'Quantity cannot be negative']
    },
    lowStockThreshold: {
      type: Number,
      default: 10
    },
    trackInventory: {
      type: Boolean,
      default: true
    }
  },
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    freeShipping: {
      type: Boolean,
      default: false
    },
    shippingCost: {
      type: Number,
      default: 0
    },
    estimatedDelivery: {
      min: Number, // days
      max: Number  // days
    }
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: String,
    comment: String,
    verified: {
      type: Boolean,
      default: false
    },
    helpful: {
      type: Number,
      default: 0
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  qna: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    answer: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isDigital: {
    type: Boolean,
    default: false
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  // Flexible attributes for category-specific details (e.g., Fabric type, Origin)
  attributes: {
    type: Map,
    of: String,
    default: undefined
  },
  variants: [{
    name: String,
    options: [String],
    price: Number,
    sku: String,
    inventory: Number
  }]
}, {
  timestamps: true
});

// Index for search functionality
productSchema.index({
  title: 'text',
  description: 'text',
  brand: 'text',
  tags: 'text'
});

// Index for filtering
productSchema.index({ category: 1, price: 1, brand: 1, isActive: 1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual for availability status
productSchema.virtual('availability').get(function() {
  if (!this.isActive) return 'inactive';
  if (this.inventory.quantity === 0) return 'out_of_stock';
  if (this.inventory.quantity <= this.inventory.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

// Method to update average rating
productSchema.methods.updateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.ratings.average = 0;
    this.ratings.count = 0;
  } else {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.ratings.average = Math.round((totalRating / this.reviews.length) * 10) / 10;
    this.ratings.count = this.reviews.length;
  }
};

// Pre-save middleware to update average rating
productSchema.pre('save', function(next) {
  this.updateAverageRating();
  next();
});

module.exports = mongoose.model('Product', productSchema);


