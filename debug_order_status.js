const pool = require('./config/db');

const checkOrderStatuses = async () => {
    try {
        const client = await pool.connect();

        console.log('Checking all orders...');
        const res = await client.query('SELECT id, status, rider_id, created_at FROM orders ORDER BY created_at DESC');

        if (res.rows.length > 0) {
            console.log(`Found ${res.rows.length} orders:`);
            res.rows.forEach(order => {
                console.log(`- Order #${order.id}: Status='${order.status}', RiderID=${order.rider_id}`);
            });
        } else {
            console.log('No orders found in the database.');
        }

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
};

checkOrderStatuses();
