const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({
  path: require('path').resolve(__dirname, '../.env'),
});
console.log('JWT_SECRET:', process.env.JWT_SECRET)
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost',
  database: 'postgres', // Connect to default database first
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Setting up database...');
    
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'food_ordering';
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
    const dbResult = await client.query(checkDbQuery, [dbName]);
    
    if (dbResult.rows.length === 0) {
      console.log(`Creating database: ${dbName}...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database ${dbName} created successfully.`);
    } else {
      console.log(`Database ${dbName} already exists.`);
    }
    
    // Close connection to default database
    client.release();
    
    // Connect to the new database
    const appPool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: dbName,
      password: process.env.DB_PASSWORD || 'postgres',
      port: process.env.DB_PORT || 5432,
    });
    
    const appClient = await appPool.connect();
    
    try {
      // Read and execute schema file
      const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      
      console.log('Creating tables...');
      await appClient.query(schema);
      console.log('Tables created successfully.');
      
      console.log('Database setup completed!');
    } catch (err) {
      console.error('Error creating tables:', err.message);
      throw err;
    } finally {
      appClient.release();
      await appPool.end();
    }
  } catch (err) {
    console.error('Database setup error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
