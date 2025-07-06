import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}


export const PORT = process.env.PORT || 3000;
export const MONGO_URI = process.env.MONGO_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
export const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
export const NODE_ENV = process.env.NODE_ENV;
export const MONGO_USERNAME=process.env.MONGO_USERNAME;
export const MONGO_PASSWORD=process.env.MONGO_PASSWORD
export const MONGO_CLUSTER=process.env.MONGO_PASSWORD;
export const MONGO_DBNAME=process.env.MONGO_DBNAME;