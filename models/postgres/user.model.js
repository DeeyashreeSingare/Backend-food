const pool = require('../../config/db');
const bcrypt = require('bcryptjs');

const create = (userData, callback) => {
  const { name, email, password, role, phone, address } = userData;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return callback(err, null);
    }

    const query = `
      INSERT INTO users (name, email, password, role, phone, address, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id, name, email, role, phone, address, created_at
    `;

    pool.query(
      query,
      [name, email, hashedPassword, role || 'end_user', phone, address],
      (err, result) => {
        if (err) {
          return callback(err, null);
        }
        callback(null, result.rows[0]);
      }
    );
  });
};

const findByEmail = (email, callback) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  pool.query(query, [email], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result.rows[0] || null);
  });
};

const findById = (id, callback) => {
  const query = 'SELECT id, name, email, role, phone, address, created_at FROM users WHERE id = $1';
  pool.query(query, [id], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result.rows[0] || null);
  });
};

const update = (id, userData, callback) => {
  const { name, phone, address } = userData;
  const query = `
    UPDATE users 
    SET name = $1, phone = $2, address = $3, updated_at = NOW()
    WHERE id = $4
    RETURNING id, name, email, role, phone, address, created_at, updated_at
  `;
  pool.query(query, [name, phone, address, id], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, result.rows[0] || null);
  });
};

module.exports = {
  create,
  findByEmail,
  findById,
  update,
};
