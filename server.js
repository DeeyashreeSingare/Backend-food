const http = require('http');
const app = require('./app');
const { Server } = require('socket.io');
const { connectMongoDB } = require('./config/mongodb');
const { setupSocket } = require('./utils/socket');

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});

// Setup Socket.IO
setupSocket(io);

// Make io available globally for controllers
app.set('io', io);

// Connect to MongoDB
connectMongoDB()
  .then(() => {
    // Start server
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`PostgreSQL: Connected`);
      console.log(`MongoDB: Connected for notifications`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

module.exports = { server, io };
