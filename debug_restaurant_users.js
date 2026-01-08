const pool = require('./config/db');
const bcrypt = require('bcryptjs');

const checkRestaurantUsers = async () => {
    try {
        const client = await pool.connect();

        console.log('Checking for users with role = "restaurant"...');
        const res = await client.query('SELECT id, email, password, role FROM users WHERE role = $1', ['restaurant']);

        if (res.rows.length > 0) {
            console.log(`Found ${res.rows.length} restaurant user(s):`);
            for (const user of res.rows) {
                console.log(`- Email: ${user.email}`);
                // Test against 'test@123'
                const isMatch = await bcrypt.compare('test@123', user.password);
                console.log(`  Password matches 'test@123': ${isMatch}`);
            }
        } else {
            console.log('No users found with role "restaurant".');
        }

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
};

checkRestaurantUsers();
