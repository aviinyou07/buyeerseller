const { AdminAuditLog } = require('../models');

/**
 * Audit Log Helper
 * Inserts administrative actions into the db for transparency.
 */
const logAdminAction = async (adminId, action, entityType, entityId = null) => {
  try {
    await AdminAuditLog.create({
      admin_id: adminId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      created_at: new Date()
    });
  } catch (error) {
    console.error('Failed to write audit log:', error.message);
  }
};

module.exports = {
  logAdminAction
};
