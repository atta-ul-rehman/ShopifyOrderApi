import { Schema, model } from 'mongoose';

const reviewSchema = new Schema({
  product: {
    type: Schema.ObjectId,
    ref: 'Product',
    required: [true, 'Review must belong to a product'],
  },
  customer: {
    type: Schema.ObjectId,
    ref: 'Customer',
    required: [true, 'Review must belong to a customer'],
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating must be at most 5'],
  },
  comment: {
  type: String,
  maxlength: [500, 'Comment cannot exceed 500 characters']
},
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent duplicate reviews from the same customer for the same product
reviewSchema.index({ product: 1, customer: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calcAverageRating = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId }
    },
    {
      $group: {
        _id: '$product',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    await this.model('Product').findByIdAndUpdate(productId, {
      averageRating: stats[0].avgRating,
      numReviews: stats[0].nRating
    });
  } else {
    await this.model('Product').findByIdAndUpdate(productId, {
      averageRating: 0,
      numReviews: 0
    });
  }
};

reviewSchema.post('save', function() {
  this.constructor.calcAverageRating(this.product);
});

reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  await this.r.constructor.calcAverageRating(this.r.product);
});

export default model('Review', reviewSchema);