import { Schema, model } from 'mongoose';

const orderItemSchema = new Schema({
  product: {
    type: Schema.ObjectId,
    ref: 'Product',
    required: [true, 'Order item must belong to a product'],
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

const deliveryInfoSchema = new Schema({
  courierCompany: {
    type: String,
    trim: true,
  },
  trackingNumber: {
    type: String,
    trim: true,
  },
  trackingUrl: {
    type: String,
    trim: true,
    default: ''
  },
  shippedAt: Date,
  estimatedDelivery: Date,
});


const orderSchema = new Schema({
  customer: {
    type: Schema.ObjectId,
    ref: 'Customer',
    required: [true, 'Order must belong to a customer'],
  },
  items: {
    type: [orderItemSchema],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'Order must have at least one item',
    },
  },
  shippingAddress: {
    type: Schema.ObjectId,
    ref: 'Shipping',
    required: [true, 'Order must have a shipping address'],
  },
  payment: {
    type: Schema.ObjectId,
    ref: 'Payment',
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  statusHistory: [{
    status: String,
    changedAt: {
      type: Date,
      default: Date.now,
    },
    changedBy: String, // Could be 'system', 'customer', 'admin'
    note: String,
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Order must have a total amount'],
    min: [0, 'Total amount cannot be negative'],
  },
  isFraudulent: {
    type: Boolean,
    default: false,
  },
  fraudReason: {
    type: String,
    validate: {
      validator: function(value) {
        if (this.isFraudulent && (!value || value.trim().length === 0)) {
          return false;
        }
        return true;
      },
      message: 'Refund reason is required if order is fraudulent',
    },
  },
  deliveryInfo: deliveryInfoSchema,
  riderNote: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

// In models/Orders.js
orderSchema.virtual('returns', {
  ref: 'Return',
  foreignField: 'order',
  localField: '_id'
});
orderSchema.set('toObject', { virtuals: true });
orderSchema.set('toJSON', { virtuals: true });

orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

orderSchema.pre(/^find/, function(next) {
  this.populate('customer')
      .populate('items.product')
      .populate('shippingAddress')
      .populate('payment')
      .populate('returns');
  next();
});

export default model('Order', orderSchema);
