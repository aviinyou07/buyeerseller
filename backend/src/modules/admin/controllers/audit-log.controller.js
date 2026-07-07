const { AdminAuditLog } = require('../models');
const { error, paginate } = require('../utils/response.utils');

/**
 * List paginated Admin Audit Logs
 * GET /api/v1/admin/audit-logs
 * Query: search, entity_type, limit, page
 */
const listAuditLogs = async (req, res) => {
  const { search, entity_type, limit = 10, page = 1 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // 1. Fetch total count
    const totalItems = await AdminAuditLog.count({ entity_type, search });

    // 2. Fetch records
    const logs = await AdminAuditLog.findPaginated({
      entity_type,
      search,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });

    const processedLogs = logs.map(l => ({
      id: l.id,
      action: l.action,
      entity_type: l.entity_type,
      entity_id: l.entity_id,
      created_at: l.created_at,
      admin: l.admin_id ? { id: l.admin_id, full_name: l.admin_name, phone: l.admin_phone, role: l.admin_role } : null
    }));

    return paginate(res, 'Admin audit logs retrieved successfully', processedLogs, page, limit, totalItems);
  } catch (err) {
    console.error('List Audit Logs error:', err);
    return error(res, 'An error occurred fetching audit logs', 500);
  }
};

module.exports = {
  listAuditLogs
};
