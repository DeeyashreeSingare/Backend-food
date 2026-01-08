const pool = require('../../config/db');

const create = (paymentData, callback) => {
  const { order_id, amount, payment_method, status, transaction_id } = paymentData;
  const query = `
    INSERT INTO payments (order_id, amount, payment_method, status, transaction_id, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING *
  `;
  pool.query(
    query,
    [order_id, amount, payment_method, status || 'pending', transaction_id],
    (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result.rows[0]);
    }
  );
};

const findByOrderId = (orderId, callback) => {
  const query = 'SELECT * FROM payments WHERE order_id = $1';
  pool.query(query, [orderId], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result.rows[0] || null);
  });
};

const updateStatus = (id, status, transactionId, callback) => {
  const query = `
    UPDATE payments 
    SET status = $1, transaction_id = $2, updated_at = NOW()
    WHERE id = $3
    RETURNING *
  `;
  pool.query(query, [status, transactionId, id], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result.rows[0] || null);
  });
};

module.exports = {
  create,
  findByOrderId,
  updateStatus,
};
