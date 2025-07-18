import Order from '../models/Orders.js';
import axios from 'axios';
import Product from '../models/Products.js';
import Payment from '../models/Payments.js';
import Shipping from '../models/Shippings.js';
import Refund from '../models/Refunds.js';
import AppError from '../utils/appError.js';
import { createCustomer } from './customerService.js';
// import { updateInventoryOnOrder } from './inventoryService.js';

export async function createOrder(orderData) {
  // 1) Check if customer exists or create a new one
  const customer = await createCustomer(orderData.customer);

  // 2) Validate products and calculate total
  const products = await Promise.all(
    orderData.items.map(async (item) => {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new AppError(`No product found with ID ${item.product}`, 404);
      }
      if (product.stock < item.quantity) {
        throw new AppError(`Not enough stock for product ${product.name}`, 400);
      }
      return {
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      };
    })
  );

  const totalAmount = products.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 3) Create shipping record
  const shipping = await Shipping.create({
    customer: customer._id,
    ...orderData.shipping,
  });
  if (orderData.payment) {
    const payment = await processPaymentForOrder(order._id, orderData.payment);
    order.payment = payment._id;
    await order.save();
  } 
  // 4) Create order
  const order = await Order.create({
    customer: customer._id,
    items: products,
    shippingAddress: shipping._id,
    totalAmount,
    status: 'pending',
    statusHistory: [
      {
        status: 'pending',
        changedAt: new Date(),
        changedBy: 'system',
        note: 'Order created',
      },
    ],
  });

  // 5) Update inventory
  // await updateInventoryOnOrder(products);

  return order;
}

export async function getOrderById(orderId) {
  const order = await Order.findById(orderId)
    .populate('returns')
    .populate('refunds');
  if (!order) {
    throw new AppError('No order found with that ID', 404);
  }
  return order;
}

export async function updateOrderStatus(orderId, newStatus, changedBy, note = '') {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('No order found with that ID', 404);
  }

  order.status = newStatus;
  order.statusHistory.push({
    status: newStatus,
    changedAt: new Date(),
    changedBy,
    note,
  });

  await order.save();
  return order;
}

export async function getCustomerOrders(customerId) {
  const orders = await Order.find({ customer: customerId });
  return orders;
}

export async function processPaymentForOrder(orderId, paymentData) {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError('No order found with that ID', 404);
  }

  // Create payment record
  const payment = await Payment.create({
    order: order._id,
    amount: order.totalAmount,
    ...paymentData,
  });

  // Update order with payment reference
  order.payment = payment._id;
  await order.save();

  // Update order status if payment is successful
  if (payment.status === 'success') {
    await updateOrderStatus(orderId, 'paid', 'system', 'Payment processed successfully');
  }

  return payment;
}

export const getAllOrders = async (filters = {}) => {
  const matchStage = {};
  const email = filters['shippingAddress.email'];
  const phone = filters['shippingAddress.phone'];
  const status = filters.status;

  // Add filter for orders not older than 15 days
  if (filters.canReturn === 'true') {
  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
  matchStage.createdAt = { $gte: fifteenDaysAgo };
 }
  if (filters.customer) {
    matchStage.customer = filters.customer;
  }
  if (status) matchStage.status = status;
  const pipeline = [
    { $match: matchStage },

    {
      $lookup: {
        from: 'shippings',
        localField: 'shippingAddress',
        foreignField: '_id',
        as: 'shippingAddress',
      }
    },
    { $unwind: '$shippingAddress' },
    ...(email || phone
      ? [{
          $match: {
            ...(email && { 'shippingAddress.email': { $regex: email, $options: 'i' } }),
            ...(phone && { 'shippingAddress.phone': phone })
          }
        }]
      : []),

    {
      $lookup: {
        from: 'customers',
        localField: 'customer',
        foreignField: '_id',
        as: 'customer',
      }
    },
    { $unwind: '$customer' },

    { $unwind: '$items' },

    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'items.product',
         pipeline: [
      {
        $project: {
          name: 1,
          image: { $arrayElemAt: ["$images", 0] }, // return only the first image
        }
      }
    ]
      }
    },
    { $unwind: '$items.product' },

    {
      $group: {
        _id: '$_id',
        doc: { $first: '$$ROOT' },
        items: { $push: '$items' },
      }
    },
    {
      $addFields: {
        'doc.items': '$items',
      }
    },
    {
      $replaceRoot: {
        newRoot: {
          order: '$doc',
        },
      }
    },
  ];

  const orders = await Order.aggregate(pipeline);

  return orders;
};

export async function trackCourierOrder(orderId) {
  const order = await Order.findById(orderId);

  if (!order) throw new AppError('Order not found', 404);
  if (!order.deliveryInfo?.trackingNumber) {
    throw new AppError('Tracking number not assigned to this order', 400);
  }
  
  const trackingNumber = order.deliveryInfo.trackingNumber;
  const trackingUrl = `https://api.postex.pk/services/courier/api/guest/get-order/${trackingNumber}`;
 console.log("tracking url",trackingUrl);
  try {
    const { data } = await axios.get(trackingUrl, {
     'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Referer': 'https://postex.pk/',
    'Origin': 'https://postex.pk/',
    });

    if (data?.statusCode !== '200') {
      throw new AppError(`Courier API error: ${data.statusMessage}`, 502);
    }

    return {
      customerName: data.dist.customerName,
      trackingNumber: data.dist.trackingNumber,
      pickupDate: data.dist.orderPickupDate,
      statusHistory: data.dist.transactionStatusHistory.map((status) => ({
        message: status.transactionStatusMessage,
        code: status.transactionStatusMessageCode,
        time: status.modifiedDatetime,
      })),
    };
  } catch (err) {
    throw new AppError('Failed to fetch tracking info from courier API', 500);
  }
}

// Alternative approach using Mongoose populate (simpler but less control)
export const getOrderByIdWithPopulate = async (orderId, options = {}) => {
  const {
    includeItems = false,
    includeRefunds = false,
    includeReturns = false,
    includeCustomer = false,
    includeShippingAddress = false,
    includePayment = false
  } = options;

  let query = Order.findById(orderId).setOptions({ skipAutoPopulate: true });

  // Build populate array based on options
  const populateOptions = [];

  if (includeCustomer) {
    populateOptions.push({
      path: 'customer',
      select: 'name email phone isRegistered role createdAt'
    });
  }

  if (includeShippingAddress) {
    populateOptions.push({
      path: 'shippingAddress',
      select: 'address city state country postalCode email phone isDefault isValidated validationResult'
    });
  }

  if (includePayment) {
    populateOptions.push({
      path: 'payment',
      select: 'method amount status transactionId createdAt'
    });
  }

  if (includeItems) {
    populateOptions.push({
      path: 'items.product',
      select: 'name description price stock images categories averageRating numReviews'
    });
  }

  if (includeReturns) {
    populateOptions.push({
      path: 'returns',
      select: 'items reason status refundAmount createdAt updatedAt processedAt'
    });
  }
  if (includeRefunds) {
    populateOptions.push({
      path: 'refunds',
      select: 'items status amount createdAt receiptImage'
    });
  }
  // Apply all populate options
  if (populateOptions.length > 0) {
    query = query.populate(populateOptions);
  }

  const order = await query;

  if (!options.includeItems && order.items) {
    order.items = undefined;
  }
  // Remove returns if not requested
  if (!options.includeReturns && order.returns) {
    order.returns = undefined;
  }
  // Remove refunds if not requested
  if (!options.includeRefunds && order.refunds) {
    order.refunds = undefined;
  }
  // Remove customer if not requested
  if (!options.includeCustomer && order.customer) {
    order.customer = undefined;
  }
  // Remove shippingAddress if not requested
  if (!options.includeShippingAddress && order.shippingAddress) {
    order.shippingAddress = undefined;
  }
  // Remove payment if not requested
  if (!options.includePayment && order.payment) {
    order.payment = undefined;
  }
  
  return order;
};

export const getAllOrdersWithPopulate = async (filters = {}, options = {}) => {
  // Reuse the filter logic from getAllOrders
  const matchStage = {};
  const email = filters['shippingAddress.email'];
  const phone = filters['shippingAddress.phone'];
  const status = filters.status;

  if (filters.canReturn === 'true') {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    matchStage.createdAt = { $gte: fifteenDaysAgo };
  }
  if (filters.customer) {
    matchStage.customer = filters.customer;
  }
  if (status) matchStage.status = status;

  // Find all orders matching the filters
  let orders = await Order.find(matchStage).setOptions({ skipAutoPopulate: true });

  // Build populate array based on options
  const populateOptions = [];
  if (options.includeCustomer) {
    populateOptions.push({
      path: 'customer',
      select: 'name email phone isRegistered role createdAt'
    });
  }
  if (options.includeShippingAddress) {
    populateOptions.push({
      path: 'shippingAddress',
      select: 'address city state country postalCode email phone isDefault isValidated validationResult'
    });
  }
  if (options.includePayment) {
    populateOptions.push({
      path: 'payment',
      select: 'method amount status transactionId createdAt'
    });
  }
  if (options.includeItems) {
    populateOptions.push({
      path: 'items.product',
      select: 'name description price stock images categories averageRating numReviews'
    });
  }
  if (options.includeReturns) {
    populateOptions.push({
      path: 'returns',
      select: 'items status createdAt updatedAt processedAt'
    });
  }
  if (options.includeRefunds) {
    populateOptions.push({
      path: 'refunds',
      select: 'items status amount createdAt receiptImage'
    });
  }
  if (populateOptions.length > 0) {
    orders = await Order.populate(orders, populateOptions);
  }

  // For each order, handle refunds and remove fields as needed
  const result = await Promise.all(orders.map(async (order) => {
    // If refunds are requested, fetch them
    // Remove items if not requested
    if (!options.includeItems && order.items) {
      order.items = undefined;
    }
    // Remove returns if not requested
    if (!options.includeReturns && order.returns) {
      order.returns = undefined;
    }
    // Remove refunds if not requested
    if (!options.includeRefunds && order.refunds) {
      order.refunds = undefined;
    }
    // Remove customer if not requested
    if (!options.includeCustomer && order.customer) {
      order.customer = undefined;
    }
    // Remove shippingAddress if not requested
    if (!options.includeShippingAddress && order.shippingAddress) {
      order.shippingAddress = undefined;
    }
    // Remove payment if not requested
    if (!options.includePayment && order.payment) {
      order.payment = undefined;
    }
    return order;
  }));

  return result;
};
