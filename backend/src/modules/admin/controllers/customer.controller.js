const { User, SellerProfile } = require("../models");
const bcrypt = require("bcryptjs");
const { success, error, paginate } = require("../utils/response.utils");
const { logAdminAction } = require("../middlewares/audit.middleware");

/**
 * List Customers (Buyers & Sellers)
 * GET /api/v1/admin/customers
 * Query: type (all|buyer|seller), search, status, limit, page
 */
const listCustomers = async (req, res) => {
  const { type = "all", search, status, limit = 10, page = 1 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // 1. Fetch count and records using User model method
    const { customers, totalItems } = await User.findCustomers({
      type,
      search,
      status,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });

    const processedCustomers = await Promise.all(
      customers.map(async (u) => {
        const customer = {
          id: u.id,
          uuid: u.uuid,
          full_name: u.full_name,
          phone: u.phone,
          email: u.email,
          role: (u.seller_profile_id && u.is_buyer_activity) ? "Both" : (u.seller_profile_id ? "Seller" : (u.is_buyer_activity ? "Buyer" : "User")),
          account_status: u.account_status,
          address: u.address || u.location || null,
          created_at: u.created_at,
          seller_profile_id: u.seller_profile_id || null,
          business_name: u.business_name || null,
          gst_number: u.gst_number || null,
          is_verified: u.is_verified === 1 || u.is_verified === true || false,
        };

        if (u.seller_profile_id) {
          const metrics = await SellerProfile.getSellerMetrics(
            u.seller_profile_id,
          );
          customer.seller_details = {
            seller_profile_id: u.seller_profile_id,
            business_name: u.business_name,
            gst_number: u.gst_number,
            is_verified: u.is_verified === 1 || u.is_verified === true,
            total_listings: metrics.totalListings,
            total_orders: metrics.totalOrders,
            total_revenue: metrics.totalRevenue,
          };
        }

        // Aggregate buyer metrics
        const buyerMetrics = await User.getBuyerMetrics(u.id);
        customer.buyer_details = {
          total_orders_placed: buyerMetrics.total_orders_placed,
          total_spent: buyerMetrics.total_spent,
        };

        return customer;
      }),
    );

    return paginate(
      res,
      "Customers list retrieved successfully",
      processedCustomers,
      page,
      limit,
      totalItems,
    );
  } catch (err) {
    console.error("List Customers error:", err);
    return error(res, "An error occurred fetching customer list", 500);
  }
};

/**
 * Get detailed customer profile
 * GET /api/v1/admin/customers/:id
 */
const getCustomerProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findProfileById(id);

    if (!user) {
      return error(res, "Customer not found", 404);
    }

    const customer = {
      id: user.id,
      uuid: user.uuid,
      full_name: user.full_name,
      phone: user.phone,
      address: user.address || user.location || null,
      role: (user.seller_profile_id && user.is_buyer_activity) ? "Both" : (user.seller_profile_id ? "Seller" : (user.is_buyer_activity ? "Buyer" : "User")),
      account_status: user.account_status,
      created_at: user.created_at,
      seller_profile_id: user.seller_profile_id || null,
      business_name: user.business_name || null,
      gst_number: user.gst_number || null,
      is_verified: user.is_verified === 1 || user.is_verified === true || false,
    };

    // Fetch buyer stats
    const buyerMetrics = await User.getBuyerMetrics(id);
    customer.buyer_metrics = {
      total_orders_placed: buyerMetrics.total_orders_placed,
      total_spent: buyerMetrics.total_spent,
    };

    // Fetch seller stats
    if (user.seller_profile_id) {
      const metrics = await SellerProfile.getSellerMetrics(
        user.seller_profile_id,
      );
      customer.seller_metrics = {
        business_name: user.business_name,
        gst_number: user.gst_number,
        is_verified: user.is_verified === 1 || user.is_verified === true,
        total_listings: metrics.totalListings,
        total_orders: metrics.totalOrders,
        total_revenue: metrics.totalRevenue,
      };
    }

    return success(res, "Customer profile details retrieved", customer);
  } catch (err) {
    console.error("Customer Profile error:", err);
    return error(res, "An error occurred retrieving customer profile", 500);
  }
};

/**
 * Update Customer Account Status (block/suspend/activate)
 * PATCH /api/v1/admin/customers/:id/status
 */
const updateCustomerStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["active", "suspended", "blocked"].includes(status)) {
    return error(
      res,
      "Invalid status. Must be 'active', 'suspended', or 'blocked'.",
      400,
    );
  }

  try {
    const user = await User.findById(id);

    if (!user || user.account_status === "deleted") {
      return error(res, "Customer not found", 404);
    }

    if (user.role === "admin") {
      return error(res, "Cannot change status of another administrator", 403);
    }

    await User.updateStatus(id, status);

    await logAdminAction(
      req.user.id,
      `Changed account status of user '${user.full_name}' (${user.phone}) to: ${status}`,
      "User",
      id,
    );

    return success(res, `Customer status updated to ${status} successfully`, {
      id: user.id,
      full_name: user.full_name,
      account_status: status,
    });
  } catch (err) {
    console.error("Update Customer Status error:", err);
    return error(res, "An error occurred updating account status", 500);
  }
};

/**
 * Create Customer (Admin)
 * POST /api/v1/admin/customers
 */
const createCustomer = async (req, res) => {
  const {
    full_name,
    phone,
    password,
    role = "user",
    address = null,
  } = req.body;

  if (!full_name || !phone || !password) {
    return error(res, "Please provide full_name, phone and password", 400);
  }

  if (role === "admin") {
    return error(
      res,
      "Cannot create administrative accounts via this endpoint",
      403,
    );
  }

  try {
    const existing = await User.findByPhone(phone);
    if (existing && existing.account_status !== "deleted") {
      return error(res, "A user with this phone number already exists", 409);
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      full_name,
      phone,
      password_hash,
      role: "user",
      account_status: "active",
      address,
    });

    if (!user) {
      return error(res, "Failed to create customer account", 500);
    }

    let sellerProfileId = null;
    if (role === "seller") {
      const { pool } = require("../config/database");
      const [spResult] = await pool.query(
        "INSERT INTO seller_profiles (user_id, business_name, gst_number, is_verified) VALUES (?, ?, NULL, 0)",
        [user.id, `${full_name} Store`]
      );
      sellerProfileId = spResult.insertId;
    }

    await logAdminAction(
      req.user.id,
      `Created customer account: '${user.full_name}' (${user.phone})`,
      "User",
      user.id,
    );

    return success(res, "Customer account created successfully", {
      id: user.id,
      uuid: user.uuid,
      full_name: user.full_name,
      phone: user.phone,
      role: role,
      account_status: user.account_status,
      address: user.address || address,
      seller_profile_id: sellerProfileId,
    });
  } catch (err) {
    console.error("Create Customer error:", err);
    return error(res, "An error occurred creating customer account", 500);
  }
};

/**
 * Delete Customer (Soft delete)
 * DELETE /api/v1/admin/customers/:id
 */
const deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user || user.account_status === "deleted") {
      return error(res, "Customer not found", 404);
    }

    if (user.role === "admin") {
      return error(res, "Cannot delete administrative account", 403);
    }

    await User.softDelete(id);

    await logAdminAction(
      req.user.id,
      `Soft-deleted customer account: '${user.full_name}' (${user.phone})`,
      "User",
      id,
    );

    return success(res, "Customer account deleted successfully");
  } catch (err) {
    console.error("Delete Customer error:", err);
    return error(res, "An error occurred deleting customer account", 500);
  }
};

/**
 * Verify Seller Business Profile
 * PATCH /api/v1/admin/customers/sellers/:sellerProfileId/verify
 */
const verifySeller = async (req, res) => {
  const { sellerProfileId } = req.params;
  const { is_verified } = req.body;

  if (is_verified === undefined) {
    return error(res, "Please specify is_verified status (true/false)", 400);
  }

  try {
    const seller = await SellerProfile.findById(sellerProfileId);

    if (!seller) {
      return error(res, "Seller profile not found", 404);
    }

    await SellerProfile.updateVerification(sellerProfileId, is_verified);

    const actionText = is_verified ? "Verified" : "Unverified";
    await logAdminAction(
      req.user.id,
      `${actionText} business seller: '${seller.business_name}'`,
      "SellerProfile",
      sellerProfileId,
    );

    return success(res, `Seller verification status set to ${is_verified}`, {
      id: sellerProfileId,
      business_name: seller.business_name,
      is_verified,
    });
  } catch (err) {
    console.error("Verify Seller error:", err);
    return error(
      res,
      "An error occurred verifying seller business details",
      500,
    );
  }
};

module.exports = {
  createCustomer,
  listCustomers,
  getCustomerProfile,
  updateCustomerStatus,
  deleteCustomer,
  verifySeller,
};
