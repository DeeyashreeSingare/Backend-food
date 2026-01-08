const pool = require('../../config/db');

const create = (orderData, callback) => {
  const { user_id, restaurant_id, items, total_amount, delivery_address, status } = orderData;
  const query = `
    INSERT INTO orders (user_id, restaurant_id, items, total_amount, delivery_address, status, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    RETURNING *
  `;
  pool.query(
    query,
    [user_id, restaurant_id, JSON.stringify(items), total_amount, delivery_address, status || 'pending'],
    (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result.rows[0]);
    }
  );
};

const findById = (id, callback) => {
  const query = 'SELECT * FROM orders WHERE id = $1';
  pool.query(query, [id], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    if (result.rows[0]) {
      result.rows[0].items = typeof result.rows[0].items === 'string'
        ? JSON.parse(result.rows[0].items)
        : result.rows[0].items;
    }
    callback(null, result.rows[0] || null);
  });
};

const findByUserId = (userId, callback) => {
  const query = 'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC';
  pool.query(query, [userId], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    result.rows.forEach(row => {
      row.items = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
    });
    callback(null, result.rows);
  });
};

const findByRestaurantId = (restaurantId, callback) => {
  const query = 'SELECT * FROM orders WHERE restaurant_id = $1 ORDER BY created_at DESC';
  pool.query(query, [restaurantId], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    result.rows.forEach(row => {
      row.items = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
    });
    callback(null, result.rows);
  });
};

const findByRiderId = (riderId, callback) => {
  const query = 'SELECT * FROM orders WHERE rider_id = $1 ORDER BY created_at DESC';
  pool.query(query, [riderId], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    result.rows.forEach(row => {
      row.items = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
    });
    callback(null, result.rows);
  });
};

const findAvailableForRider = (callback) => {
  // Show orders that are ready for pickup (ready status) or confirmed/preparing (for early pickup)
  // AND not assigned to any rider yet
  const query = `
    SELECT * FROM orders 
    WHERE status IN ('ready', 'confirmed', 'preparing') 
    AND rider_id IS NULL 
    ORDER BY 
      CASE 
        WHEN status = 'ready' THEN 1
        WHEN status = 'preparing' THEN 2
        WHEN status = 'confirmed' THEN 3
        ELSE 4
      END,
      created_at ASC
  `;
  pool.query(query, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    result.rows.forEach(row => {
      row.items = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
    });
    callback(null, result.rows);
  });
};

const updateStatus = (id, status, callback) => {
  const query = `
    UPDATE orders 
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  pool.query(query, [status, id], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    if (result.rows[0]) {
      result.rows[0].items = typeof result.rows[0].items === 'string'
        ? JSON.parse(result.rows[0].items)
        : result.rows[0].items;
    }
    callback(null, result.rows[0] || null);
  });
};

const assignRider = (orderId, riderId, callback) => {
  const query = `
    UPDATE orders 
    SET rider_id = $1, status = 'assigned', updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  pool.query(query, [riderId, orderId], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    if (result.rows[0]) {
      result.rows[0].items = typeof result.rows[0].items === 'string'
        ? JSON.parse(result.rows[0].items)
        : result.rows[0].items;
    }
    callback(null, result.rows[0] || null);
  });
};

const updateRiderStatus = (orderId, riderId, status, callback) => {
  const validStatuses = ['picked_up', 'on_the_way', 'delivered'];
  if (!validStatuses.includes(status)) {
    return callback(new Error('Invalid status'), null);
  }

  const query = `
    UPDATE orders 
    SET status = $1, updated_at = NOW()
    WHERE id = $2 AND rider_id = $3
    RETURNING *
  `;
  pool.query(query, [status, orderId, riderId], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    if (result.rows[0]) {
      result.rows[0].items = typeof result.rows[0].items === 'string'
        ? JSON.parse(result.rows[0].items)
        : result.rows[0].items;
    }
    callback(null, result.rows[0] || null);
  });
};

module.exports = {
  create,
  findById,
  findByUserId,
  findByRestaurantId,
  findByRiderId,
  findAvailableForRider,
  updateStatus,
  assignRider,
  updateRiderStatus,
};
