// @ts-nocheck
export {};
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
    firstName: String,
    lastName: String,
    company: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'US'
    },
    phone: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  paymentMethods: [{
    type: {
      type: String,
      enum: ['card', 'paypal', 'amazon_pay'],
      required: true
    },
    cardNumber: String,
    expiryMonth: String,
    expiryYear: String,
    cardHolderName: String,
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  orderHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  preferences: {
    newsletter: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    emailNotifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.emailVerificationToken;
    delete ret.passwordResetToken;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);


