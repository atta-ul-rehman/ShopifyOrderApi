import { Schema, model } from 'mongoose';

const productSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Please provide a product price'],
    min: [0, 'Price cannot be negative'],
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    // max: [10000, 'Stock cannot exceed 10000'], // optional limit
  },
  images: [{
    type: String,
    required: [true, 'Please provide at least one image URL'],
    validate: {
      validator: function(v) {
        // Simple URL regex validation
         return /^https?:\/\/.+/.test(v);
      },
      message: props => `${props.value} is not a valid image URL!`,
    }
  }],
  categories: [{
    type: Schema.ObjectId,
    ref: 'Category',
    required: [true, 'Product must belong to at least one category'],
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must be at most 5'],
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
});

productSchema.index({ name: 'text', description: 'text' });

export default model('Product', productSchema);
