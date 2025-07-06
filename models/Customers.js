import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs'; // Missing import

const customerSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+\@.+\..+/, 'Please provide a valid email'] ,// Added email validation
    index: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    validate: {
      validator: function(v) {
        return /\d{10,15}/.test(v); // Simple phone number validation
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  isRegistered: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    select: false,
    minlength: [8, 'Password must be at least 8 characters long'], // Added validation
    required: function() { return this.isRegistered; } // Only required for registered users
  },
  passwordChangedAt: Date, // Missing field needed for changedPasswordAfter method
  role: { // Added role field for restrictTo middleware
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to hash password before saving
customerSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now() - 1000; // Ensures token is created after password change
  next();
});

// Instance method to compare passwords
customerSchema.methods.correctPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if password was changed after token was issued
customerSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Indexes for faster query performance
customerSchema.index({ phone: 1 });

export default model('Customer', customerSchema);