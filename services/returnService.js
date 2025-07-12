import ReturnModel from '../models/Returns.js';
import Order from '../models/Orders.js';
import AppError from '../utils/appError.js';
import Product from '../models/Products.js';

export async function createReturn(data, userId) {
  const { order, customer, items } = data;

  const existingOrder = await Order.findById(order);
  if (!existingOrder) throw new AppError('Order not found', 404);

  if (existingOrder.status !== 'delivered') {
    throw new AppError('Cannot initiate return: order has not been delivered yet.', 400);
  }

  if (existingOrder.customer._id.toString() !== customer) {
    throw new AppError('You are not authorized to return this order.', 403);
  }

  // Get all existing returns for this order
  const existingReturns = await ReturnModel.find({ order });
  
  // Create maps for original order items
  const orderedProductIds = existingOrder.items.map(item => item.product._id.toString());
  const orderItemMap = new Map();
  existingOrder.items.forEach(item => {
    orderItemMap.set(item.product._id.toString(), item.quantity);
  });

  // Create map for already returned quantities
  const returnedQuantityMap = new Map();
  existingReturns.forEach(returnDoc => {
    returnDoc.items.forEach(item => {
      const productId = item.product.toString();
      const currentReturned = returnedQuantityMap.get(productId) || 0;
      returnedQuantityMap.set(productId, currentReturned + item.quantity);
    });
  });

  // Validate items being returned
  for (const item of items) {
    if (!orderedProductIds.includes(item.product)) {
      throw new AppError(`Product ${item.product} not part of the original order.`, 400);
    }

    const orderedQty = orderItemMap.get(item.product);
    const alreadyReturnedQty = returnedQuantityMap.get(item.product) || 0;
    const availableToReturn = orderedQty - alreadyReturnedQty;

    if (item.quantity > availableToReturn) {
      throw new AppError(
        `Cannot return ${item.quantity} units of product ${item.product}. ` +
        `Only ${availableToReturn} units available to return (${orderedQty} ordered, ${alreadyReturnedQty} already returned).`,
        400
      );
    }
  }

  // Get product details for status history
  const productIds = items.map(item => item.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map();
  products.forEach(product => {
    productMap.set(product._id.toString(), product);
  });

  // Create items with product names for status history
  const itemsWithNames = items.map(item => {
    const product = productMap.get(item.product);
    return {
      product: item.product,
      productName: product ? product.name : 'Unknown Product',
      quantity: item.quantity,
      reason: item.reason
    };
  });

  const newReturn = await ReturnModel.create({
    order,
    customer,
    items,
    status: 'initiated',
    statusHistory: [
      {
        previousStatus: 'initiated',
        newStatus: 'initiated',
        processedBy: data.statusHistory[0].processedBy,
        actionTaken: 'Return initiated',
        notes: data.statusHistory[0].notes || 'Return initiated by customer',
        processedAt: new Date(),
        itemsProcessed: itemsWithNames
      }
    ]
  });

  return newReturn;
}
export async function getReturnById(returnId) {
  const ret = await ReturnModel.findById(returnId)
    .populate('customer', 'name email phone')
    .populate('items.product', 'name price images');

  if (!ret) throw new AppError('Return not found', 404);
  return ret;
}

export async function updateReturnStatus(returnId, newStatus, userId, note = '') {
  const ret = await ReturnModel.findById(returnId);
  if (!ret) throw new AppError('Return not found', 404);

  const previousStatus = ret.status;
  ret.status = newStatus;
  ret.statusHistory.push({
    previousStatus,
    newStatus,
    processedBy: userId || 'system',
    processedAt: new Date(),
    notes: note,
    actionTaken: `Status changed to ${newStatus}`,
  });

  await ret.save();
  return ret;
}

export async function getReturnsByCustomer(customerId) {
  return ReturnModel.find({ customer: customerId });
}


// export async function getReturnsByCustomer(customerId) {
//   return ReturnModel.find({ customer: customerId })
//     .populate('customer', 'name email phone')
//     .populate('items.product', 'name price images');
// }

export async function getReturnsByOrder(orderId) {
  return ReturnModel.find({ order: orderId })
    .populate('customer', 'name email phone')
    .populate('items.product', 'name price images');
}

// New function to get return summary for an order
export async function getOrderReturnSummaryService(orderId) {
  const existingOrder = await Order.findById(orderId);
  if (!existingOrder) throw new AppError('Order not found', 404);

  const returns = await ReturnModel.find({ order: orderId })
    .populate('items.product', 'name price');

  // Calculate returned quantities per product
  const returnedQuantityMap = new Map();
  const returnSummary = [];

  returns.forEach(returnDoc => {
    returnDoc.items.forEach(item => {
      const productId = item.product._id.toString();
      const currentReturned = returnedQuantityMap.get(productId) || 0;
      returnedQuantityMap.set(productId, currentReturned + item.quantity);
    });
  });

  // Create summary with original order items
  existingOrder.items.forEach(orderItem => {
    const productId = orderItem.product._id.toString();
    const returnedQty = returnedQuantityMap.get(productId) || 0;
    const availableToReturn = orderItem.quantity - returnedQty;

    returnSummary.push({
      product: orderItem.product,
      orderedQuantity: orderItem.quantity,
      returnedQuantity: returnedQty,
      availableToReturn: availableToReturn
    });
  });

  return {
    order: existingOrder,
    returns: returns,
    returnSummary: returnSummary
  };
}