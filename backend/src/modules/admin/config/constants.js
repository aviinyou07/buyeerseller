module.exports = {
  ROLES: {
    ADMIN: 'admin',
    USER: 'user'
  },
  ACCOUNT_STATUS: {
    ACTIVE: 'active',
    SUSPENDED: 'suspended',
    BLOCKED: 'blocked',
    DELETED: 'deleted'
  },
  LISTING_STATUS: {
    DRAFT: 'draft',
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    SOLD: 'sold',
    ARCHIVED: 'archived'
  },
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
  },
  PAYMENT_STATUS: {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILED: 'failed',
    REFUNDED: 'refunded'
  },
  REPORT_STATUS: {
    PENDING: 'pending',
    RESOLVED: 'resolved',
    REJECTED: 'rejected'
  },
  SCHEME_TYPE: {
    CURRENT: 'current',
    UPCOMING: 'upcoming'
  },
  NOTIFICATION_TYPES: {
    SYSTEM: 'system',
    LISTING: 'listing',
    ORDER: 'order',
    PROMOTIONAL: 'promotional'
  }
};
