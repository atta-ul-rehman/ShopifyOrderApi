# ShopifyOrderAPI Information

## Summary
A mock server for testing VoiceFlow agents through a real e-commerce API. This project provides a comprehensive set of RESTful endpoints that simulate an e-commerce platform with customers, products, orders, payments, and more.

## Structure
- **config/**: Database and environment configuration
- **controllers/**: Request handlers for each route
- **middleware/**: Authentication and error handling middleware
- **models/**: Mongoose data models
- **routes/**: API route definitions
- **services/**: Business logic implementation
- **utils/**: Helper functions and utilities
- **seeders/**: Data seeding scripts

## Language & Runtime
**Language**: JavaScript (Node.js)
**Version**: ES Modules (type: "module")
**Framework**: Express.js
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- express: ^4.19.2 - Web framework
- mongoose: ^8.16.1 - MongoDB ODM
- jsonwebtoken: ^9.0.2 - Authentication
- bcryptjs: ^3.0.2 - Password hashing
- @faker-js/faker: ^9.9.0 - Test data generation
- dotenv: ^17.0.1 - Environment configuration
- helmet: ^8.1.0 - Security headers
- cors: ^2.8.5 - Cross-origin resource sharing

**Development Dependencies**:
- nodemon: ^3.1.10 - Development server
- eslint: ^9.30.1 - Code linting
- prettier: ^3.6.2 - Code formatting

## Build & Installation
```bash
npm install
npm run dev    # Development with auto-reload
npm start      # Production
```

## Deployment
**Platform**: Vercel
**Configuration**: vercel.json defines build settings and routes
**Entry Point**: server.js

## API Structure
**Base URL**: /api/v1
**Rate Limiting**: 100 requests per hour
**Authentication**: JWT-based via /api/v1/auth routes
**Main Endpoints**:
- /api/v1/customers - Customer management
- /api/v1/products - Product catalog
- /api/v1/orders - Order processing
- /api/v1/payments - Payment handling
- /api/v1/cart - Shopping cart operations
- /api/v1/refunds - Refund processing
- /api/v1/users - User management

## Database
**Type**: MongoDB
**Connection**: Environment variables control connection
**Models**: 
- User - Authentication and authorization
- Customer - Customer information
- Product - Product catalog
- Order - Order processing
- Payment - Payment transactions
- Cart - Shopping cart
- Refund - Refund processing

## Security Features
- Helmet for HTTP security headers
- Rate limiting protection
- MongoDB query sanitization
- XSS protection
- Parameter pollution prevention
- CORS configuration