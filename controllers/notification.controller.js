const Notification = require('../models/mongodb/notification.model');

const getNotifications = (req, res) => {
  // Get notifications for user OR role-based notifications
  const userRole = req.userRole || null;
  
  console.log('getNotifications called - userId:', req.userId, 'role:', userRole);
  
  try {
    if (userRole) {
      // Fetch notifications for user_id OR role-based notifications
      Notification.findByUserIdOrRole(req.userId, userRole, (err, notifications) => {
        if (err) {
          console.error('Error fetching notifications (by role):', err.message);
          // If MongoDB is not connected, return empty array instead of error
          if (err.message && err.message.includes('MongoDB not connected')) {
            console.log('MongoDB not connected - returning empty array');
            return res.status(200).send([]);
          }
          return res.status(500).send({ message: err.message });
        }

        console.log('Notifications fetched (by role):', notifications?.length || 0);
        res.status(200).send(notifications || []);
      });
    } else {
      // Fallback to user_id only
      Notification.findByUserId(req.userId, (err, notifications) => {
        if (err) {
          console.error('Error fetching notifications (by user):', err.message);
          // If MongoDB is not connected, return empty array instead of error
          if (err.message && err.message.includes('MongoDB not connected')) {
            console.log('MongoDB not connected - returning empty array');
            return res.status(200).send([]);
          }
          return res.status(500).send({ message: err.message });
        }

        console.log('Notifications fetched (by user):', notifications?.length || 0);
        res.status(200).send(notifications || []);
      });
    }
  } catch (error) {
    console.error('Exception in getNotifications:', error.message);
    // Handle case where getMongoDB throws an error
    if (error.message && error.message.includes('MongoDB not connected')) {
      return res.status(200).send([]);
    }
    return res.status(500).send({ message: error.message });
  }
};

const markAsRead = (req, res) => {
  const { ObjectId } = require('mongodb');
  const notificationId = new ObjectId(req.params.id);

  Notification.markAsRead(notificationId, (err, result) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    res.status(200).send({
      message: 'Notification marked as read',
      result,
    });
  });
};

const markAllAsRead = (req, res) => {
  Notification.markAllAsRead(req.userId, (err, result) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    res.status(200).send({
      message: 'All notifications marked as read',
      result,
    });
  });
};

const deleteNotification = (req, res) => {
  const { ObjectId } = require('mongodb');
  const notificationId = new ObjectId(req.params.id);

  Notification.deleteNotification(notificationId, (err, result) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    res.status(200).send({
      message: 'Notification deleted',
      result,
    });
  });
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
