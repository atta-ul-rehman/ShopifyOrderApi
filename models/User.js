// models/User.js
import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'User must have a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'User must have an email'],
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
  },
  role: {
    type: String,
    enum: ['admin', 'superadmin', 'agent', 'developer'],
    default: 'agent',
  },
  password: {
    type: String,
    required: [true, 'User must have a password'],
    minlength: 6,
    select: false, // hide by default in queries
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default model('User', userSchema);
