const { Pool } = require('pg');
require('dotenv').config();

// If DATABASE_URL is provided, use it exclusively (for Neon, Render, etc.)
// Otherwise, use individual connection parameters
let config;

if (process.env.DATABASE_URL) {
  // Use connection string (preferred for cloud databases)
  config = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Neon and most cloud PostgreSQL
    }
  };
  console.log('Using DATABASE_URL for PostgreSQL connection');
} else {
  // Use individual connection parameters (for local development)
  config = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'food_ordering',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
    ssl: false
  };
  console.log('Using individual DB parameters for PostgreSQL connection');
}

const pool = new Pool(config);

pool.on('connect', () => {
  console.log('PostgreSQL connected');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  console.error('Error code:', err.code);
  console.error('Error message:', err.message);
  // Don't exit on error - let the app handle it gracefully
  // process.exit(-1);
});

// Test connection on startup
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('PostgreSQL connection test failed:', err);
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);
  } else {
    console.log('PostgreSQL connection test successful');
    console.log('Current database time:', result.rows[0].now);
  }
});

module.exports = pool;
