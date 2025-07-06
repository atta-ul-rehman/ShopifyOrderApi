// individualRouteTest.js - Test each route individually
import express from 'express';

const routeConfigs = [
  { path: '/api/v1/auth', name: 'authRoutes' },
  { path: '/api/v1/customers', name: 'customerRoutes' },
  { path: '/api/v1/products', name: 'productRoutes' },
  { path: '/api/v1/orders', name: 'orderRoutes' },
  { path: '/api/v1/payments', name: 'paymentRoutes' },
  { path: '/api/v1/cart', name: 'cartRoutes' },
  { path: '/api/v1/refunds', name: 'refundRoutes' }
];

console.log('🔍 Testing each route individually...\n');

for (const { path, name } of routeConfigs) {
  console.log(`\n🧪 Testing ${name}...`);
  
  try {
    // Create fresh app for each test
    const app = express();
    
    // Import the route
    const routeModule = await import(`./routes/${name}.js`);
    const router = routeModule.default;
    
    console.log(`✅ ${name} imported successfully`);
    
    // Check router structure
    if (router.stack) {
      console.log(`   📋 ${name} has ${router.stack.length} route(s):`);
      router.stack.forEach((layer, index) => {
        if (layer.route) {
          console.log(`   - Route ${index + 1}: "${layer.route.path}" [${Object.keys(layer.route.methods).join(', ')}]`);
          if (layer.route.path === undefined) {
            console.error(`   ❌ UNDEFINED PATH found at route ${index + 1}!`);
          }
        } else {
          console.log(`   - Middleware ${index + 1}: ${layer.regexp ? layer.regexp.toString() : 'function'}`);
        }
      });
    }
    
    // Try to register the route
    console.log(`   🔄 Registering ${name} at ${path}...`);
    app.use(path, router);
    console.log(`   ✅ ${name} registered successfully!`);
    
  } catch (error) {
    console.error(`   ❌ ${name} failed:`, error.message);
    
    if (error.message.includes('Missing parameter name')) {
      console.error(`   🎯 PATH-TO-REGEXP ERROR found in ${name}!`);
      console.error(`   This route has an undefined path that's causing the issue.`);
    }
    
    console.error(`   Stack trace:`, error.stack);
  }
}

console.log('\n🎯 Individual route testing complete!');