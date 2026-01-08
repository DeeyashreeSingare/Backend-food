const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB_NAME || 'food_ordering_notifications';

let client;
let db;

const connectMongoDB = async () => {
  try {
    // Add connection options for better reliability
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };
    
    client = new MongoClient(uri, options);
    await client.connect();
    db = client.db(dbName);
    console.log('MongoDB connected for notifications');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('Connection URI (without password):', uri.replace(/:[^:@]+@/, ':****@'));
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
