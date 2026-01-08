const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});

let socketCount = 0;

io.on('connection', (socket) => {
  socketCount++;
  console.log(`Socket connected: ${socket.id} (Total: ${socketCount})`);
  
  socket.on('disconnect', () => {
    socketCount--;
    console.log(`Socket disconnected: ${socket.id} (Total: ${socketCount})`);
  });
});

server.listen(3001, () => {
  console.log('Test server running on port 3001');
  console.log('Waiting for socket connections...');
});
