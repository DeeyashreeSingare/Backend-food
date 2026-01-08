const { Pool } = require('pg');
require('dotenv').config();

// If DATABASE_URL is provided, use it exclusively (for Neon, Render, etc.)
// Otherwise, use individual connection parameters
let config;

if (process.env.DATABASE_URL) {
  // Clean the connection string (remove any whitespace)
  const connectionString = process.env.DATABASE_URL.trim();
  
  // Validate connection string format
  if (!connectionString.startsWith('postgresql://') && !connectionString.startsWith('postgres://')) {
    console.error('ERROR: DATABASE_URL must start with postgresql:// or postgres://');
    console.error('Current DATABASE_URL:', connectionString.substring(0, 50) + '...');
    throw new Error('Invalid DATABASE_URL format');
  }
  
  // Use connection string (preferred for cloud databases)
  // Note: SSL settings in connection string take precedence, but we add ssl option as fallback
  config = {
    connectionString: connectionString,
    // SSL will be handled by the connection string, but we add this for compatibility
    ssl: connectionString.includes('sslmode=require') ? {
      rejectUnauthorized: false // Required for Neon and most cloud PostgreSQL
    } : false
  };
  console.log('Using DATABASE_URL for PostgreSQL connection');
  console.log('Connection string (masked):', connectionString.replace(/:[^:@]+@/, ':****@'));
} else {
  // Use individual connection parameters
  // Check if this is a cloud database (Neon, Render, etc.) by checking if host contains cloud indicators
  const host = process.env.DB_HOST || 'localhost';
  const isCloudDB = host.includes('.neon.tech') || 
                     host.includes('.render.com') || 
                     host.includes('.aws') ||
                     host.includes('pooler');
  
  config = {
    user: process.env.DB_USER || 'postgres',
    host: host,
    database: process.env.DB_NAME || 'food_ordering',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT) || 5432,
    // Enable SSL for cloud databases (Neon requires SSL)
    ssl: isCloudDB ? {
      rejectUnauthorized: false // Required for Neon and most cloud PostgreSQL
    } : false
  };
  console.log('Using individual DB parameters for PostgreSQL connection');
  console.log('Host:', config.host);
  console.log('Database:', config.database);
  console.log('User:', config.user);
  console.log('Port:', config.port);
  console.log('SSL:', config.ssl ? 'enabled' : 'disabled');
  console.log('Cloud DB detected:', isCloudDB);
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
