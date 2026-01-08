const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/auth.config');
const User = require('../models/postgres/user.model');

const signup = (req, res) => {
  const { name, email, password, role, phone, address } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).send({ message: 'Name, email, and password are required' });
  }

  User.create({ name, email, password, role, phone, address }, (err, user) => {
    if (err) {
      console.error('Signup error:', err);
      
      // Handle specific database errors
      if (err.code === '23505') { // Unique violation (duplicate email)
        return res.status(400).send({ message: 'Email already exists' });
      }
      
      if (err.code === '42P01') { // Table doesn't exist
        return res.status(500).send({ 
          message: 'Database table not found. Please run database setup script.',
          error: err.message 
        });
      }
      
      if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        return res.status(500).send({ 
          message: 'Database connection failed. Please check database configuration.',
          error: err.message 
        });
      }
      
      // Generic error
      return res.status(500).send({ 
        message: 'Error creating user',
        error: err.message,
        code: err.code 
      });
    }

    if (!user) {
      return res.status(500).send({ message: 'User creation failed - no user returned' });
    }

    try {
      const token = jwt.sign({ id: user.id, role: user.role }, config.secret, {
        expiresIn: config.jwtExpiration,
      });

      res.status(201).send({
        message: 'User registered successfully!',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken: token,
      });
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return res.status(500).send({ message: 'Error generating authentication token' });
    }
  });
};

const signin = (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).send({ message: 'Email and password are required' });
  }

  User.findByEmail(email, (err, user) => {
    if (err) {
      console.error('Signin error:', err);
      
      // Handle specific database errors
      if (err.code === '42P01') { // Table doesn't exist
        return res.status(500).send({ 
          message: 'Database table not found. Please run database setup script.',
          error: err.message 
        });
      }
      
      if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        return res.status(500).send({ 
          message: 'Database connection failed. Please check database configuration.',
          error: err.message 
        });
      }
      
      return res.status(500).send({ 
        message: 'Error finding user',
        error: err.message,
        code: err.code 
      });
    }

    if (!user) {
      return res.status(404).send({ message: 'User Not found.' });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: 'Invalid Password!',
      });
    }

    try {
      const token = jwt.sign({ id: user.id, role: user.role }, config.secret, {
        expiresIn: config.jwtExpiration,
      });

      res.status(200).send({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        accessToken: token,
      });
    } catch (tokenError) {
      console.error('Token generation error:', tokenError);
      return res.status(500).send({ message: 'Error generating authentication token' });
    }
  });
};

module.exports = {
  signup,
  signin,
};
