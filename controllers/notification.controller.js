const Notification = require('../models/mongodb/notification.model');

const getNotifications = (req, res) => {
  // Get notifications for user OR role-based notifications
  const userRole = req.userRole || null;
  
  if (userRole) {
    // Fetch notifications for user_id OR role-based notifications
    Notification.findByUserIdOrRole(req.userId, userRole, (err, notifications) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }

      res.status(200).send(notifications);
    });
  } else {
    // Fallback to user_id only
    Notification.findByUserId(req.userId, (err, notifications) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }

      res.status(200).send(notifications);
    });
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
