import ReturnModel from '../models/Returns.js';
import Order from '../models/Orders.js';
import AppError from '../utils/appError.js';

export async function createReturn(data, userId) {
  const { order, customer, items } = data;

  const existingOrder = await Order.findById(order);
  if (!existingOrder) throw new AppError('Order not found', 404);

  if (existingOrder.status !== 'delivered') {
    throw new AppError('Cannot initiate return: order has not been delivered yet.', 400);
  }

//   const existingReturn = await ReturnModel.findOne({ order });
  if (existingOrder.returns && existingOrder.returns.length > 0) {
    throw new AppError('Return already initiated for this order.', 400);
  }
  
  if (existingOrder.customer._id.toString() !== customer) {
  throw new AppError('You are not authorized to return this order.', 403);
 }
  const orderedProductIds = existingOrder.items.map(item => item.product._id.toString());

  const orderItemMap = new Map();
  existingOrder.items.forEach(item => {
    orderItemMap.set(item.product._id.toString(), item.quantity);
  });
        console.log(orderItemMap);
  for (const item of items) {
    if (!orderedProductIds.includes(item.product)) {
      throw new AppError(`Product ${item.product} not part of the original order.`, 400);
    }
    const orderedQty = orderItemMap.get(item.product);
    if (!orderedQty || item.quantity > orderedQty) {
      throw new AppError(`Cannot return more than ordered quantity for product ${item.product}`, 400);
    }
  }

  const newReturn = await ReturnModel.create({
    order,
    customer,
    items,
    status: 'initiated',
    statusHistory: [
      {
        previousStatus: 'initiated',
        newStatus: 'initiated',
        processedBy: userId || data.statusHistory[0].processedBy ||'system',
        actionTaken: data.statusHistory[0].actionTaken || 'Return initiated',
        notes: data.statusHistory[0].notes || '',
        processedAt: new Date(),
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
