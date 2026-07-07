import jwt from 'jsonwebtoken';
import {
  getUserAddresses,
  getUserPaymentMethods,
  getUserBankAccounts,
  getUserKycStatus,
  getSellerEarnings
} from './users.queries.js';

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
 * GET /api/users/profile-data
 */
export async function getProfileData(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const [addresses, paymentMethods, bankAccounts, kyc, earnings] = await Promise.all([
      getUserAddresses(user.id),
      getUserPaymentMethods(user.id),
      getUserBankAccounts(user.id),
      getUserKycStatus(user.id),
      getSellerEarnings(user.id)
    ]);

    return res.json({
      success: true,
      profileData: {
        addresses,
        paymentMethods,
        bankAccounts,
        kyc,
        earnings
      }
    });
  } catch (error) {
    console.error('[users.getProfileData]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}
