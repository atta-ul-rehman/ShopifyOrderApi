import { verify } from 'jsonwebtoken';
import AppError from '../utils/appError.js';
import { JWT_SECRET } from '../config/env.js';

export default (req, res, next) => {
  // 1) Get token from header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verify token
  verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new AppError('Invalid token. Please log in again!', 401));
    }
    
    // 3) Attach user to request object
    req.user = decoded;
    next();
  });
};