const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB_NAME || 'food_ordering_notifications';

let client;
let db;

const connectMongoDB = async () => {
  try {
    // Add connection options for better reliability and SSL handling
    const options = {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      connectTimeoutMS: 10000, // Connection timeout
      retryWrites: true,
      w: 'majority',
      // SSL/TLS options
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      // Use IPv4
      family: 4
    };
    
    console.log('Attempting to connect to MongoDB...');
    console.log('Database name:', dbName);
    
    client = new MongoClient(uri, options);
    await client.connect();
    
    // Test the connection
    await client.db('admin').command({ ping: 1 });
    
    db = client.db(dbName);
    console.log('MongoDB connected for notifications');
    console.log('Connected to database:', dbName);
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.error('Error code:', error.code);
    
    // Provide helpful error messages
    if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
      console.error('❌ DNS/Network Error: Check your connection string format');
      console.error('Make sure your password is URL-encoded (e.g., @ becomes %40)');
    } else if (error.message.includes('tlsv1 alert') || error.message.includes('SSL')) {
      console.error('❌ SSL/TLS Error: This usually means:');
      console.error('1. Your IP address is not whitelisted in MongoDB Atlas');
      console.error('2. Go to MongoDB Atlas → Network Access → Add IP Address');
      console.error('3. Add 0.0.0.0/0 (allow from anywhere) or Render\'s specific IPs');
    } else if (error.message.includes('authentication')) {
      console.error('❌ Authentication Error: Check your username and password');
      console.error('Make sure password is URL-encoded if it contains special characters');
    }
    
    console.error('Connection URI (masked):', uri.replace(/:[^:@]+@/, ':****@'));
    throw error;
  }
};

const getMongoDB = () => {
  if (!db) {
    throw new Error('MongoDB not connected. Call connectMongoDB first.');
  }
  return db;
};

module.exports = {
  connectMongoDB,
  getMongoDB,
};
