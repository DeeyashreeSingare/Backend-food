const pool = require('./config/db');
const bcrypt = require('bcryptjs');

const checkPasswords = async () => {
    try {
        const client = await pool.connect();

        // specific user from logs
        const email = 'testrider@gmail.com';
        const res = await client.query('SELECT id, email, password, role FROM users WHERE email = $1', [email]);

        if (res.rows.length > 0) {
            const user = res.rows[0];
            console.log('User found:', user.email);
            console.log('Stored Password Hash:', user.password);

            const testPass = 'test@123';
            const isMatch = await bcrypt.compare(testPass, user.password);
            console.log(`Testing password '${testPass}':`, isMatch ? 'MATCH' : 'NO MATCH');

            // Also check if it's plain text (just in case)
            if (user.password === testPass) {
                console.log('WARNING: Password is stored as plain text!');
            }
        } else {
            console.log('User not found:', email);
        }

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
};

checkPasswords();
