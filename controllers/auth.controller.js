const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/auth.config');
const User = require('../models/postgres/user.model');

const signup = (req, res) => {
  const { name, email, password, role, phone, address } = req.body;

  User.create({ name, email, password, role, phone, address }, (err, user) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

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
  });
};

const signin = (req, res) => {
  const { email, password } = req.body;

  User.findByEmail(email, (err, user) => {
    if (err) {
      return res.status(500).send({ message: err.message });
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
  });
};

module.exports = {
  signup,
  signin,
};
