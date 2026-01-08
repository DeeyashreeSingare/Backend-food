const pool = require('../config/db');

const up = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Add image_url to restaurants
        await client.query(`
      ALTER TABLE restaurants 
      ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);
    `);
        console.log('Added image_url to restaurants');

        // Add image_url to menu_items
        await client.query(`
      ALTER TABLE menu_items 
      ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);
    `);
        console.log('Added image_url to menu_items');

        await client.query('COMMIT');
        console.log('Migration completed successfully');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        process.exit();
    }
};

up();
