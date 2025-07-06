import express, { json, urlencoded } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import compression from 'compression';
// Routes
import customerRoutes from './routes/customerRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
// import reviewRoutes from './routes/reviewRoutes.js';
// import categoryRoutes from './routes/categoryRoutes.js';
// import shippingRoutes from './routes/shippingRoutes.js';
import refundRoutes from './routes/refundRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import AppError from './utils/appError.js';
import globalErrorHandler from './middleware/error.js';

const app = express();
// Security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(json({ limit: '10kb' }));
app.use(urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: [
    'duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'
  ]
}));

// Compression middleware
app.use(compression());

// CORS
app.use(cors());
app.options('/*', cors());

app.get('/', (req, res) => {
  console.log('Your app is working!');
  res.status(200).json({ message: 'Your app is working!' });
});

// 2) ROUTES
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/cart', cartRoutes);
// app.use('/api/v1/reviews', reviewRoutes);
// app.use('/api/v1/categories', categoryRoutes);
// app.use('/api/v1/shipping', shippingRoutes);
app.use('/api/v1/refunds', refundRoutes);
app.use('/api/v1/users', userRoutes);
// 3) ERROR HANDLING
app.all('/*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;