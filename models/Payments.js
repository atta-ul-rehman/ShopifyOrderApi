import { Schema, model } from 'mongoose';
import crypto from 'crypto'; // For generating a unique transaction ID

const paymentSchema = new Schema({
  order: {
    type: Schema.ObjectId,
    ref: 'Order',
    required: [true, 'Payment must belong to an order'],
  },
  amount: {
    type: Number,
    required: [true, 'Please provide payment amount'],
    min: [1, 'Amount must be at least 1'],
  },
  method: {
    type: String,
    required: [true, 'Please provide payment method'],
    enum: {
      values: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cod'],
      message: '{VALUE} is not a supported payment method',
    },
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'success', 'failed', 'refunded'],
      message: '{VALUE} is not a valid status',
    },
    default: 'pending',
  },
  transactionId: {
    type: String,
    trim: true,
    unique: true,
  },
  paymentDetails: {
    type: Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  transactionId:{
    type:String,
    unique:true,
  }
});

// 🔄 Generate transaction ID before saving

export default model('Payment', paymentSchema);
