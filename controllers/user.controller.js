const User = require('../models/postgres/user.model');

const getProfile = (req, res) => {
  User.findById(req.userId, (err, user) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    res.status(200).send(user);
  });
};

const updateProfile = (req, res) => {
  const { name, phone, address } = req.body;

  User.update(req.userId, { name, phone, address }, (err, user) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    res.status(200).send({
      message: 'Profile updated successfully',
      user,
    });
  });
};

module.exports = {
  getProfile,
  updateProfile,
};
