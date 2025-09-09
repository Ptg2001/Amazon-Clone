// @ts-nocheck
export {};
const { validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

// Custom validation for MongoDB ObjectId
const isValidObjectId = (value) => {
  const mongoose = require('mongoose');
  return mongoose.Types.ObjectId.isValid(value);
};

// Custom validation for password strength
const isStrongPassword = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && 
         (hasUpperCase || hasLowerCase) && 
         hasNumbers;
};

// Custom validation for email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Custom validation for phone number
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

// Sanitize input to prevent XSS
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitize(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  if (req.params) {
    req.params = sanitize(req.params);
  }
  
  next();
};

// Rate limiting for specific routes
const createRateLimit = (windowMs, max, message) => {
  const rateLimit = require('express-rate-limit');
  
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// File upload validation
const validateFileUpload = (allowedTypes, maxSize) => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files || [req.file];
    
    for (const file of files) {
      // Check file type
      if (allowedTypes && !allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
        });
      }

      // Check file size
      if (maxSize && file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`
        });
      }
    }

    next();
  };
};

module.exports = {
  handleValidationErrors,
  isValidObjectId,
  isStrongPassword,
  isValidEmail,
  isValidPhone,
  sanitizeInput,
  createRateLimit,
  validateFileUpload
};


