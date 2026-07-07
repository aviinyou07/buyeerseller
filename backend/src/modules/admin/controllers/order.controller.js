const { Order, OrderItem } = require('../models');
const { success, error, paginate } = require('../utils/response.utils');
const { logAdminAction } = require('../middlewares/audit.middleware');

/**
 * List all marketplace orders
 * GET /api/v1/admin/orders
 * Query: status, search, limit, page
 */
const listOrders = async (req, res) => {
  const { status, search, limit = 10, page = 1 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // 1. Fetch total count
    const totalItems = await Order.count({ status, search });

    // 2. Fetch paginated orders
    const orders = await Order.findPaginated({
      status,
      search,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });

    const processedOrders = orders.map(o => ({
      id: o.id,
      order_number: o.order_number,
      total_amount: parseFloat(o.total_amount || 0),
      order_status: o.order_status,
      created_at: o.created_at,
      buyer: { id: o.buyer_id, full_name: o.buyer_name, phone: o.buyer_phone },
      seller: { id: o.seller_id, business_name: o.business_name, user: { full_name: o.seller_name, phone: o.seller_phone } }
    }));

    return paginate(res, 'Orders list retrieved successfully', processedOrders, page, limit, totalItems);
  } catch (err) {
    console.error('List Orders error:', err);
    return error(res, 'An error occurred fetching orders list', 500);
  }
};

/**
 * Get detailed order view (items, payments, tracking)
 * GET /api/v1/admin/orders/:id
 */
const getOrderDetails = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Fetch order details
    const order = await Order.findDetailsById(id);

    if (!order) {
      return error(res, 'Order not found', 404);
    }

    // 2. Fetch order items
    const items = await OrderItem.findByOrder(id);

    const details = {
      id: order.id,
      order_number: order.order_number,
      total_amount: parseFloat(order.total_amount || 0),
      order_status: order.order_status,
      created_at: order.created_at,
      buyer: {
        id: order.buyer_id,
        full_name: order.buyer_name,
        phone: order.buyer_phone,
        account_status: order.buyer_status
      },
      seller: {
        id: order.seller_id,
        business_name: order.business_name,
        gst_number: order.gst_number,
        is_verified: order.is_verified === 1 || order.is_verified === true,
        user: { id: order.seller_user_id, full_name: order.seller_name, phone: order.seller_phone }
      },
      transaction: order.transaction_db_id ? {
        id: order.transaction_db_id,
        transaction_id: order.txn_reference,
        payment_status: order.payment_status
      } : null,
      items: items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: parseFloat(item.price || 0),
        listing: { id: item.listing_id, title: item.listing_title, price: parseFloat(item.listing_price || 0) }
      }))
    };

    return success(res, 'Order details retrieved successfully', details);
  } catch (err) {
    console.error('Get Order Details error:', err);
    return error(res, 'An error occurred retrieving order details', 500);
  }
};

/**
 * Update order status
 * PATCH /api/v1/admin/orders/:id/status
 * Body payload: { status: 'pending' | 'confirmed' | 'shipped' | 'delivered' }
 */
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'confirmed', 'shipped', 'delivered'].includes(status)) {
    return error(res, "Invalid status. Must be 'pending', 'confirmed', 'shipped', or 'delivered'.", 400);
  }

  try {
    const order = await Order.findById(id);

    if (!order) {
      return error(res, 'Order not found', 404);
    }

    if (order.order_status === 'cancelled') {
      return error(res, 'Cannot change status of a cancelled order', 400);
    }

    await Order.updateStatus(id, status);

    await logAdminAction(
      req.user.id, 
      `Updated order status of '${order.order_number}' to: ${status}`, 
      'Order', 
      id
    );

    const updatedOrder = await Order.findById(id);

    return success(res, `Order status updated to ${status} successfully`, updatedOrder);
  } catch (err) {
    console.error('Update Order Status error:', err);
    return error(res, 'An error occurred updating order status', 500);
  }
};

/**
 * Cancel Order
 * POST /api/v1/admin/orders/:id/cancel
 */
const cancelOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);

    if (!order) {
      return error(res, 'Order not found', 404);
    }

    if (order.order_status === 'delivered') {
      return error(res, 'Cannot cancel an order that has already been delivered', 400);
    }

    await Order.cancel(id);

    await logAdminAction(req.user.id, `Cancelled order: ${order.order_number}`, 'Order', id);

    const updatedOrder = await Order.findById(id);

    return success(res, 'Order cancelled successfully', updatedOrder);
  } catch (err) {
    console.error('Cancel Order error:', err);
    return error(res, 'An error occurred cancelling order', 500);
  }
};

/**
 * Refund Order transaction
 * POST /api/v1/admin/orders/:id/refund
 */
const refundOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findDetailsById(id);

    if (!order) {
      return error(res, 'Order not found', 404);
    }

    if (!order.transaction_db_id) {
      return error(res, 'No transaction record associated with this order to refund', 404);
    }

    if (order.payment_status === 'refunded') {
      return error(res, 'Transaction is already refunded', 400);
    }

    await Order.refundTransactional(id);

    await logAdminAction(
      req.user.id, 
      `Refunded payment of order: ${order.order_number} (Transaction ID: ${order.txn_reference})`, 
      'Order', 
      id
    );

    const updatedOrder = await Order.findById(id);

    return success(res, 'Order transaction refunded successfully', updatedOrder);
  } catch (err) {
    console.error('Refund Order error:', err);
    return error(res, 'An error occurred refunding transaction', 500);
  }
};

module.exports = {
  listOrders,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder,
  refundOrder
};
