const { getMongoDB } = require('../../config/mongodb');

const create = (notificationData, callback) => {
  try {
    const db = getMongoDB();
    const collection = db.collection('notifications');

  const notification = {
    ...notificationData,
    user_id: notificationData.user_id ? Number(notificationData.user_id) : null,
    created_at: new Date(),
    read: false,
  };

    collection.insertOne(notification, (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, { ...notification, _id: result.insertedId });
    });
  } catch (error) {
    // If MongoDB is not connected, silently fail (notifications are optional)
    if (error.message && error.message.includes('MongoDB not connected')) {
      console.warn('MongoDB not connected - notification not saved');
      return callback(null, null);
    }
    callback(error, null);
  }
};

const findByUserId = (userId, callback) => {
  try {
    const db = getMongoDB();
    const collection = db.collection('notifications');

    collection
      .find({ user_id: Number(userId) })
      .sort({ created_at: -1 })
      .toArray((err, result) => {
        if (err) {
          return callback(err, null);
        }
        callback(null, result);
      });
  } catch (error) {
    if (error.message && error.message.includes('MongoDB not connected')) {
      return callback(null, []);
    }
    callback(error, null);
  }
};

const findByUserIdOrRole = (userId, userRole, callback) => {
  try {
    const db = getMongoDB();
    const collection = db.collection('notifications');

    // Find notifications for this user OR role-based notifications for this role
    const query = {
      $or: [
        { user_id: Number(userId) },
        { role_target: userRole, user_id: null }
      ]
    };

    collection
      .find(query)
      .sort({ created_at: -1 })
      .toArray((err, result) => {
        if (err) {
          return callback(err, null);
        }
        callback(null, result);
      });
  } catch (error) {
    if (error.message && error.message.includes('MongoDB not connected')) {
      return callback(null, []);
    }
    callback(error, null);
  }
};

const markAsRead = (notificationId, callback) => {
  try {
    const db = getMongoDB();
    const collection = db.collection('notifications');

    collection.updateOne(
      { _id: notificationId },
      { $set: { read: true, read_at: new Date() } },
      (err, result) => {
        if (err) {
          return callback(err, null);
        }
        callback(null, result);
      }
    );
  } catch (error) {
    if (error.message && error.message.includes('MongoDB not connected')) {
      return callback(null, { acknowledged: false });
    }
    callback(error, null);
  }
};

const markAllAsRead = (userId, callback) => {
  try {
    const db = getMongoDB();
    const collection = db.collection('notifications');

    collection.updateMany(
      { user_id: userId, read: false },
      { $set: { read: true, read_at: new Date() } },
      (err, result) => {
        if (err) {
          return callback(err, null);
        }
        callback(null, result);
      }
    );
  } catch (error) {
    if (error.message && error.message.includes('MongoDB not connected')) {
      return callback(null, { acknowledged: false });
    }
    callback(error, null);
  }
};

const deleteNotification = (notificationId, callback) => {
  try {
    const db = getMongoDB();
    const collection = db.collection('notifications');

    collection.deleteOne({ _id: notificationId }, (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result);
    });
  } catch (error) {
    if (error.message && error.message.includes('MongoDB not connected')) {
      return callback(null, { acknowledged: false });
    }
    callback(error, null);
  }
};

module.exports = {
  create,
  findByUserId,
  findByUserIdOrRole,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
