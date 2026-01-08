const pool = require('../config/db');

const checkDuplicateEmail = (req, res, next) => {
  const { email } = req.body;

  pool.query('SELECT id FROM users WHERE email = $1', [email], (err, result) => {
    if (err) {
      return res.status(500).send({
        message: err.message,
      });
    }

    if (result.rows.length > 0) {
      return res.status(400).send({
        message: 'Failed! Email is already in use!',
      });
    }

    next();
  });
};

const checkRolesExisted = (req, res, next) => {
  const { role } = req.body;

  if (role) {
    const validRoles = ['end_user', 'restaurant', 'rider', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).send({
        message: `Failed! Role does not exist. Valid roles: ${validRoles.join(', ')}`,
      });
    }
  }

  next();
};

module.exports = {
  checkDuplicateEmail,
  checkRolesExisted,
};
