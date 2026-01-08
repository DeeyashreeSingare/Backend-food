const pool = require('./config/db');

const testDb = async () => {
    try {
        const client = await pool.connect();
        console.log('Database connected successfully');

        const res = await client.query('SELECT id, email, role FROM users');
        console.log('Users found:', res.rows.length);
        console.log('Users details:', res.rows);

        client.release();
    } catch (err) {
        console.error('Database connection error:', err);
    } finally {
        // End the pool to allow script to exit
        await pool.end();
    }
};

testDb();
