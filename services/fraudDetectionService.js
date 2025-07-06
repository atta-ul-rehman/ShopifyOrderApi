import { get } from 'axios';
import config from '../config/db.js';
import { GOOGLE_MAPS_API_KEY } from '../config/env.js';
async function analyzeOrder(orderData) {
  const { address, email, phone } = orderData;

  // Validate email format
  const isValidEmail = /\S+@\S+\.\S+/.test(email);
  if (!isValidEmail) return { isFraud: true, reason: 'Invalid email format' };

  // Validate phone number
  const isValidPhone = /^\+?[1-9]\d{7,14}$/.test(phone);
  if (!isValidPhone) return { isFraud: true, reason: 'Invalid phone number' };

  // Validate address via Google Maps Geocoding API
  const response = await get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`);
  const isValidAddress = response.data.results.length > 0;
  if (!isValidAddress) return { isFraud: true, reason: 'Invalid address' };

  return { isFraud: false };
}

export default { analyzeOrder };