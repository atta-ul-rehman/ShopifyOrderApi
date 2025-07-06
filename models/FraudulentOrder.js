import { Schema, model } from 'mongoose';

const fraudulentOrderSchema = new Schema({
  order: {
    type: Schema.ObjectId,
    ref: 'Order',
    required: [true, 'Fraudulent order must reference an order'],
  },
  customer: {
    type: Schema.ObjectId,
    ref: 'Customer',
    required: [true, 'Fraudulent order must belong to a customer'],
  },
  reason: {
    type: String,
    required: [true, 'Please provide fraud reason'],
  },
  details: Schema.Types.Mixed,
  actionTaken: {
    type: String,
    enum: ['none', 'flagged', 'blocked', 'refunded', 'investigating'],
    default: 'none',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model('FraudulentOrder', fraudulentOrderSchema);