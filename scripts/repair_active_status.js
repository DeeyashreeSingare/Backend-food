const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'deeyashreesingare',
    host: process.env.DB_HOST || 'localhost',
    database: 'food_ordering',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

pool.query("UPDATE restaurants SET is_active = true WHERE is_active IS NULL", (err, res) => {
    if (err) {
        console.error(err);
    } else {
        console.log(`Updated ${res.rowCount} restaurants to active.`);
    }
    pool.end();
});
