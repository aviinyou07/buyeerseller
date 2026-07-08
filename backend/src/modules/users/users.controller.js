import jwt from 'jsonwebtoken';
import {
  getUserAddresses,
  getUserPaymentMethods,
  getUserBankAccounts,
  getUserKycStatus,
  getSellerEarnings,
  updateUserProfile,
  updateUserAddress,
  updateSellerProfileByUserId
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

/**
 * PATCH /api/users/profile-data
 */
export async function updateProfileData(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

  const { full_name, email, phone, address, business_name, gst_number } = req.body;

  if (!full_name || !email || !phone || !address) {
    return res.status(400).json({ success: false, message: 'Full name, email, phone, and address are required.' });
  }

  try {
    // Update basic user profile
    await updateUserProfile(user.id, { full_name, email, phone });

    // Update primary address
    await updateUserAddress(user.id, address);

    // If seller details are provided, update seller profile
    if (business_name || gst_number) {
      await updateSellerProfileByUserId(user.id, { business_name, gst_number });
    }

    return res.json({ success: true, message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('[users.updateProfileData]', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}
