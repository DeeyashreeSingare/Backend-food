const { getMongoDB } = require('../../config/mongodb');

const create = (notificationData, callback) => {
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
};

const findByUserId = (userId, callback) => {
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
};

const findByUserIdOrRole = (userId, userRole, callback) => {
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
};

const markAsRead = (notificationId, callback) => {
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
};

const markAllAsRead = (userId, callback) => {
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
};

const deleteNotification = (notificationId, callback) => {
  const db = getMongoDB();
  const collection = db.collection('notifications');

  collection.deleteOne({ _id: notificationId }, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  });
};

module.exports = {
  create,
  findByUserId,
  findByUserIdOrRole,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
