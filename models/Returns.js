import mongoose from 'mongoose';

const returnStatusHistorySchema = new mongoose.Schema({
  previousStatus: {
    type: String,
    enum: ['initiated', 'approved', 'rejected', 'completed'],
    required: true,
  },
  newStatus: {
    type: String,
    enum: ['initiated', 'approved', 'rejected', 'completed'],
    required: true,
  },
  processedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  processedAt: {
    type: Date,
    default: Date.now,
  },
  notes: String,
  actionTaken: String,
});

const returnSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
    required: true,
  },
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'Customer',
    required: true,
  },
  items: [
    {
      product: { type: mongoose.Schema.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      reason: { type: String },
    }
  ],
  status: {
    type: String,
    enum: ['initiated', 'approved', 'rejected', 'completed'],
    default: 'initiated',
  },
  statusHistory: [returnStatusHistorySchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Return', returnSchema);
