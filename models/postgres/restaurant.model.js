const pool = require('../../config/db');

const create = (restaurantData, callback) => {
  const { name, description, address, phone, owner_id, is_active, image_url } = restaurantData;
  const query = `
    INSERT INTO restaurants (name, description, address, phone, owner_id, is_active, image_url, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    RETURNING *
  `;
  pool.query(
    query,
    [name, description, address, phone, owner_id, is_active !== undefined ? is_active : true, image_url],
    (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result.rows[0]);
    }
  );
};

const findAll = (callback) => {
  const query = 'SELECT * FROM restaurants WHERE is_active = true ORDER BY created_at DESC';
  pool.query(query, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result.rows);
  });
};

const findById = (id, callback) => {
  const query = 'SELECT * FROM restaurants WHERE id = $1';
  pool.query(query, [id], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result.rows[0] || null);
  });
};

const findByOwnerId = (ownerId, callback) => {
  const query = 'SELECT * FROM restaurants WHERE owner_id = $1 ORDER BY created_at DESC';
  pool.query(query, [ownerId], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result.rows);
  });
};

const update = (id, restaurantData, callback) => {
  const { name, description, address, phone, is_active, image_url } = restaurantData;

  // Dynamic query construction to handle optional image update
  let query, params;

  if (image_url) {
    query = `
      UPDATE restaurants 
      SET name = $1, description = $2, address = $3, phone = $4, is_active = COALESCE($5, is_active), image_url = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `;
    params = [name, description, address, phone, is_active, image_url, id];
  } else {
    query = `
      UPDATE restaurants 
      SET name = $1, description = $2, address = $3, phone = $4, is_active = COALESCE($5, is_active), updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `;
    params = [name, description, address, phone, is_active, id];
  }

  pool.query(query, params, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result.rows[0] || null);
  });
};

const createMenuItem = (menuItemData, callback) => {
  const { restaurant_id, name, description, price, is_available, image_url } = menuItemData;
  const query = `
    INSERT INTO menu_items (restaurant_id, name, description, price, category, is_available, image_url, created_at)
    VALUES ($1, $2, $3, $4, NULL, $5, $6, NOW())
    RETURNING *
  `;
  pool.query(
    query,
    [restaurant_id, name, description, price, is_available !== undefined ? is_available : true, image_url],
    (err, result) => {
      if (err) {
        return callback(err, null);
      }
      callback(null, result.rows[0]);
    }
  );
};

const getMenuItems = (restaurantId, callback) => {
  const query = 'SELECT * FROM menu_items WHERE restaurant_id = $1 AND is_available = true ORDER BY name';
  pool.query(query, [restaurantId], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result.rows);
  });
};

const updateMenuItem = (itemId, menuItemData, callback) => {
  const { name, description, price, is_available, image_url } = menuItemData;

  let query, params;

  if (image_url) {
    query = `
      UPDATE menu_items 
      SET name = $1, description = $2, price = $3, category = NULL, is_available = $4, image_url = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `;
    params = [name, description, price, is_available, image_url, itemId];
  } else {
    query = `
      UPDATE menu_items 
      SET name = $1, description = $2, price = $3, category = NULL, is_available = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `;
    params = [name, description, price, is_available, itemId];
  }

  pool.query(query, params, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result.rows[0] || null);
  });
};

module.exports = {
  create,
  findAll,
  findById,
  findByOwnerId,
  update,
  createMenuItem,
  getMenuItems,
  updateMenuItem,
};
