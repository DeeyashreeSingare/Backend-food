const { MongoClient } = require('mongodb');

async function testMongoDB() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✓ Connected to MongoDB');
    
    const db = client.db('food_ordering_notifications');
    const collection = db.collection('notifications');
    
    // Check if collection exists and has data
    const count = await collection.countDocuments();
    console.log(`✓ Notifications collection has ${count} documents`);
    
    // Get last 5 notifications
    const recent = await collection.find().sort({ created_at: -1 }).limit(5).toArray();
    console.log('Recent notifications:', JSON.stringify(recent, null, 2));
    
  } catch (error) {
    console.error('✗ MongoDB error:', error.message);
  } finally {
    await client.close();
  }
}

testMongoDB();
