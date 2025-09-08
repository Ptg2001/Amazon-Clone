// @ts-nocheck
export {};
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  variant: {
    name: String,
    option: String,
  },
  price: {
    type: Number,
    required: true,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    totals: {
      totalItems: { type: Number, default: 0 },
      totalAmount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

cartSchema.methods.recalculateTotals = function () {
  const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  this.totals.totalItems = totalItems;
  this.totals.totalAmount = Math.round(totalAmount * 100) / 100;
};

cartSchema.pre('save', function (next) {
  this.recalculateTotals();
  next();
});

module.exports = mongoose.model('Cart', cartSchema);


