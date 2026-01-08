const { Server } = require('socket.io');
const http = require('http');
const jwt = require('jsonwebtoken');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});

const connectedUsers = {};

io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
  if (!token) {
    return next(new Error('Authentication error'));
  }

  // Skip JWT verification for this test, just decode it
  try {
    const decoded = jwt.decode(token);
    socket.userId = decoded?.id;
    socket.userRole = decoded?.role;
    next();
  } catch (err) {
    console.error('Token decode error:', err.message);
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  const room = `user_${socket.userId}`;
  console.log(`\n✓ Socket CONNECTED:`);
  console.log(`  Socket ID: ${socket.id}`);
  console.log(`  User ID: ${socket.userId}`);
  console.log(`  Role: ${socket.userRole}`);
  console.log(`  Room: ${room}`);
  
  socket.join(room);
  
  if (socket.userRole === 'rider') {
    socket.join('riders');
    console.log(`  Also joined: riders`);
  }
  if (socket.userRole === 'restaurant') {
    socket.join('restaurants');
    console.log(`  Also joined: restaurants`);
  }
  
  connectedUsers[socket.userId] = { socketId: socket.id, room, role: socket.userRole };
  
  console.log(`\nTotal connected users: ${Object.keys(connectedUsers).length}`);
  
  socket.on('disconnect', () => {
    console.log(`\n✗ Socket DISCONNECTED: ${socket.id} (User ${socket.userId})`);
    delete connectedUsers[socket.userId];
  });
});

// Endpoint to check status
const app = require('express')();
app.get('/socket-status', (req, res) => {
  const status = {
    timestamp: new Date().toISOString(),
    totalSockets: io.engine.clientsCount,
    connectedUsers: Object.keys(connectedUsers).length,
    users: Object.entries(connectedUsers).reduce((acc, [userId, data]) => {
      acc[userId] = { ...data };
      return acc;
    }, {})
  };
  res.json(status);
});

app.get('/test-emit/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const room = `user_${userId}`;
  const notification = {
    _id: 'test-' + Date.now(),
    user_id: userId,
    title: 'Test Notification',
    message: 'This is a test notification',
    created_at: new Date(),
  };
  
  io.to(room).emit('new_notification', notification);
  
  const user = connectedUsers[userId];
  res.json({
    status: 'emitted',
    room,
    notification,
    userConnected: !!user,
    user: user || null,
  });
});

server.on('request', app);
server.listen(3002, () => {
  console.log('Debug Socket server running on port 3002');
  console.log('Check status at: http://localhost:3002/socket-status');
  console.log('Test emit at: http://localhost:3002/test-emit/6');
});
