import { Schema, model } from 'mongoose';


const statusHistorySchema = new Schema({
  previousStatus: {
    type: String,
    enum: ['requested', 'approved', 'rejected', 'processed'],
    required: true,
  },
  newStatus: {
    type: String,
    enum: ['requested', 'approved', 'rejected', 'processed'],
    required: true,
  },
  processedBy: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  processedAt: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    trim: true,
  },
  actionTaken: {
    type: String, // e.g. "Changed status from requested to approved"
    required: true,
  }
});


const refundSchema = new Schema({
  order: {
    type: Schema.ObjectId,
    ref: 'Order',
    required: [true, 'Refund must belong to an order'],
  },
  customer: {
    type: Schema.ObjectId,
    ref: 'Customer',
    required: [true, 'Refund must belong to a customer'],
  },
  amount: {
    type: Number,
    required: [true, 'Please provide refund amount'],
    min: [1, 'Amount must be at least 1'],
  },
  reason: {
    type: String,
    required: [true, 'Please provide refund reason'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['requested', 'approved', 'rejected', 'processed'],
    default: 'requested',
  },
  processedAt: {
    type: Date,
    validate: {
      validator: function(value) {
        // processedAt should only be set if status is not 'requested'
        if (value && this.status === 'requested') return false;
        return true;
      },
      message: 'processedAt can only be set if status is approved, rejected, or processed',
    }
  },
  receiptImage: {
    type: String, // URL or file path to the receipt image
    validate: {
      validator: function(value) {
        // receiptImage should only be set if status is 'processed'
        if (value && this.status !== 'processed') return false;
        return true;
      },
      message: 'Receipt image can only be added when refund status is processed',
    }
  },
  statusHistory: [statusHistorySchema],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

refundSchema.pre('save', function (next) {
  const needsProcessing = ['approved', 'rejected', 'processed'].includes(this.status);

  if (needsProcessing && !this.processedAt) {
    this.processedAt = new Date();
  }

  next();
});

export default model('Refund', refundSchema);
