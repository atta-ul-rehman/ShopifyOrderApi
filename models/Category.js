import { Schema, model } from 'mongoose';
import slugify from 'slugify';

const categorySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a category name'],
    unique: true,
    trim: true,
    minlength: [3, 'Category name must be at least 3 characters'],
    maxlength: [50, 'Category name must not exceed 50 characters'],
  },
  slug: {
    type: String,
    lowercase: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [300, 'Description must not exceed 300 characters'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate slug from name
categorySchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

export default model('Category', categorySchema);
