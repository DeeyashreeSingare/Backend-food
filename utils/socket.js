const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');

const setupSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error'));
    }

    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error'));
      }
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    });
  });

  io.on('connection', (socket) => {
    const room = `user_${socket.userId}`;
    console.log(`Socket connected: ID=${socket.id}, User=${socket.userId}, Role=${socket.userRole}, Room=${room}`);

    // Join user-specific room
    socket.join(room);

    // Join role-specific rooms
    if (socket.userRole === 'restaurant') {
      socket.join('restaurants');
    }
    if (socket.userRole === 'rider') {
      socket.join('riders');
    }

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

const emitOrderUpdate = (io, order) => {
  // Emit to user
  io.to(`user_${order.user_id}`).emit('order_update', order);

  // Emit to restaurant owner - need to get owner_id from restaurant
  // This will be handled in the controller where we have access to restaurant data
  
  // Emit to rider if assigned
  if (order.rider_id) {
    io.to(`user_${order.rider_id}`).emit('order_update', order);
  }
};

const emitNotification = (io, notification) => {
  if (!notification || !notification.user_id) {
    console.log('Skipping emitNotification: No notification or user_id');
    return;
  }
  const room = `user_${notification.user_id}`;
  console.log(`Emitting new_notification to room: ${room}`, notification);
  io.to(room).emit('new_notification', notification);
};

const emitToRole = (io, role, event, data) => {
  console.log(`Emitting ${event} to role room: ${role}`);
  io.to(role === 'rider' ? 'riders' : role === 'restaurant' ? 'restaurants' : role).emit(event, data);
};

module.exports = {
  setupSocket,
  emitOrderUpdate,
  emitNotification,
  emitToRole,
};
