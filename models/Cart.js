import { Schema, model } from 'mongoose';

const cartItemSchema = new Schema({
  product: {
    type: Schema.ObjectId,
    ref: 'Product',
    required: [true, 'Cart item must belong to a product'],
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide quantity'],
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide price'],
    min: [0, 'Price cannot be negative'],
  },
});

const cartSchema = new Schema({
  customer: {
    type: Schema.ObjectId,
    ref: 'Customer',
    required: [true, 'Cart must belong to a customer'],
    unique: true,
  },
  items: [cartItemSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
  },
});

cartSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default model('Cart', cartSchema);