import jwt from 'jsonwebtoken';
import { getOrdersByBuyer, getSalesBySeller } from './orders.queries.js';

function requireAuth(req, res) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required.' });
    return null;
  }
  try {
    return jwt.verify(auth.slice(7), process.env.JWT_SECRET);
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    return null;
  }
}

/**
 * GET /api/orders
 * Returns orders where the auth user is the buyer.
 */
export async function getOrders(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;
  try {
    const orders = await getOrdersByBuyer(user.id);
    return res.json({ success: true, orders });
  } catch (error) {
    console.error('[orders.getOrders]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

/**
 * GET /api/orders/sales
 * Returns orders where the auth user is the seller.
 */
export async function getSales(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;
  try {
    const sales = await getSalesBySeller(user.id);
    return res.json({ success: true, sales });
  } catch (error) {
    console.error('[orders.getSales]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}
