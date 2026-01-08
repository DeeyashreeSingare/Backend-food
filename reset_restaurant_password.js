const pool = require('./config/db');
const bcrypt = require('bcryptjs');

const resetRestaurantPassword = async () => {
    try {
        const client = await pool.connect();

        const email = 'restro@gmail.com';
        const newPassword = 'test@123';

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const res = await client.query(
            'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email',
            [hashedPassword, email]
        );

        if (res.rows.length > 0) {
            console.log(`Password updated successfully for ${email}`);
        } else {
            console.log('User not found');
        }

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
};

resetRestaurantPassword();
