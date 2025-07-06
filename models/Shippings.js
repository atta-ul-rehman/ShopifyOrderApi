import { Schema, model } from 'mongoose';
import { validCities } from '../utils/locations.js';

const shippingSchema = new Schema({
  customer: {
    type: Schema.ObjectId,
    ref: 'Customer',
    required: [true, 'Shipping must belong to a customer'],
  },
   address: {
    type: String,
    required: [true, 'Please provide an address'],
    validate: {
      validator: function (v) {
        return validCities.some(city => v.toLowerCase().includes(city.toLowerCase()));
      },
      message: props => `${props.value} is not a valid Punjab (Pakistan) address!`
    }
  },
  city: {
    type: String,
    required: [true, 'Please provide city'],
    enum: {
      values: validCities,
      message: '{VALUE} is not a supported city in Punjab'
    }
  },
  state: {
    type: String,
    required: [true, 'Please provide state'],
    enum: ['Punjab'],
  },
  country: {
    type: String,
    required: [true, 'Please provide country'],
    enum: ['Pakistan'],
  },
  postalCode: {
    type: String,
    required: [true, 'Please provide postal code'],
    validate: {
      validator: function (v) {
        return /^\d{5}$/.test(v);
      },
      message: props => `${props.value} is not a valid postal code!`
    }
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email address'],
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^[0-9\-\+]{9,15}$/, 'Please enter a valid phone number'],
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  isValidated: {
    type: Boolean,
    default: false,
  },
  validationResult: Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
export default model('Shipping', shippingSchema);