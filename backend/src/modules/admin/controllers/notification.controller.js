const { Notification, User } = require('../models');
const { success, error } = require('../utils/response.utils');
const { logAdminAction } = require('../middlewares/audit.middleware');

/**
 * List sent notifications (latest first)
 * GET /api/v1/admin/notifications
 */
const listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll();

    const processed = notifications.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      is_read: n.is_read === 1 || n.is_read === true,
      user: n.user_id ? { id: n.user_id, full_name: n.full_name, phone: n.phone } : null
    }));

    return success(res, 'Notifications retrieved successfully', processed);
  } catch (err) {
    console.error('List Notifications error:', err);
    return error(res, 'An error occurred fetching notifications list', 500);
  }
};

/**
 * Send notification to targeted user bases
 * POST /api/v1/admin/notifications/send
 * Body: { target: 'all' | 'buyers' | 'sellers' | 'specific', user_id, title, message }
 */
const sendNotification = async (req, res) => {
  const { target, user_id, title, message } = req.body;

  if (!target || !title || !message) {
    return error(res, 'Please provide target, title, and message parameters', 400);
  }

  if (!['all', 'buyers', 'sellers', 'specific'].includes(target)) {
    return error(res, "Invalid target. Must be 'all', 'buyers', 'sellers', or 'specific'.", 400);
  }

  try {
    let targetUsers = [];

    if (target === 'specific') {
      if (!user_id) {
        return error(res, 'Please provide user_id for specific targeting', 400);
      }
      const user = await User.findById(user_id);
      if (!user) {
        return error(res, 'Specified user not found', 404);
      }
      targetUsers = [user];
    } else if (target === 'sellers') {
      targetUsers = await User.findSellers();
    } else if (target === 'buyers') {
      targetUsers = await User.findBuyers();
    } else { // target === 'all'
      targetUsers = await User.findActiveUsers();
    }

    if (targetUsers.length === 0) {
      return error(res, 'No users found in targeted group to notify', 400);
    }

    await Notification.createMany(targetUsers, title, message);

    await logAdminAction(
      req.user.id, 
      `Dispatched target notification to ${target} (${targetUsers.length} users): '${title}'`, 
      'Notification'
    );

    return success(res, `Notification successfully dispatched to ${targetUsers.length} users.`);
  } catch (err) {
    console.error('Send Notification error:', err);
    return error(res, 'An error occurred sending notifications', 500);
  }
};

module.exports = {
  listNotifications,
  sendNotification
};
