const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');

const verifyToken = (req, res, next) => {
  // Try multiple header formats
  let token = req.headers['x-access-token'];
  
  if (!token && req.headers['authorization']) {
    const authHeader = req.headers['authorization'];
    // Handle "Bearer <token>" format
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (authHeader.includes(' ')) {
      token = authHeader.split(' ')[1];
    } else {
      token = authHeader;
    }
  }

  if (!token) {
    return res.status(403).send({
      message: 'No token provided!',
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: 'Unauthorized!',
        error: err.message,
      });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

const isEndUser = (req, res, next) => {
  if (req.userRole === 'end_user') {
    next();
    return;
  }
  res.status(403).send({
    message: 'Require End User Role!',
  });
};

const isRestaurant = (req, res, next) => {
  if (req.userRole === 'restaurant') {
    next();
    return;
  }
  res.status(403).send({
    message: 'Require Restaurant Role!',
  });
};

const isRider = (req, res, next) => {
  if (req.userRole === 'rider') {
    next();
    return;
  }
  res.status(403).send({
    message: 'Require Rider Role!',
  });
};

const isAdmin = (req, res, next) => {
  if (req.userRole === 'admin') {
    next();
    return;
  }
  res.status(403).send({
    message: 'Require Admin Role!',
  });
};

module.exports = {
  verifyToken,
  isEndUser,
  isRestaurant,
  isRider,
  isAdmin,
};
