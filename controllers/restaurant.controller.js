const Restaurant = require('../models/postgres/restaurant.model');

const createRestaurant = (req, res) => {
  const { name, description, address, phone, is_active } = req.body;

  Restaurant.create(
    {
      name,
      description,
      address,
      phone,
      owner_id: req.userId,
      is_active,
      image_url: req.file ? `/uploads/${req.file.filename}` : (req.body.image_url || null),
    },
    (err, restaurant) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }

      res.status(201).send({
        message: 'Restaurant created successfully',
        restaurant,
      });
    }
  );
};

const getAllRestaurants = (req, res) => {
  Restaurant.findAll((err, restaurants) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    res.status(200).send(restaurants);
  });
};

const getRestaurantById = (req, res) => {
  Restaurant.findById(req.params.id, (err, restaurant) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    if (!restaurant) {
      return res.status(404).send({ message: 'Restaurant not found' });
    }

    res.status(200).send(restaurant);
  });
};

const getMyRestaurants = (req, res) => {
  Restaurant.findByOwnerId(req.userId, (err, restaurants) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    res.status(200).send(restaurants);
  });
};

const updateRestaurant = (req, res) => {
  const { name, description, address, phone, is_active } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;

  Restaurant.update(req.params.id, { name, description, address, phone, is_active, image_url }, (err, restaurant) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    if (!restaurant) {
      return res.status(404).send({ message: 'Restaurant not found' });
    }

    res.status(200).send({
      message: 'Restaurant updated successfully',
      restaurant,
    });
  });
};

const createMenuItem = (req, res) => {
  const { name, description, price, is_available } = req.body;
  const restaurantId = req.params.restaurantId;
  const image_url = req.file ? `/uploads/${req.file.filename}` : (req.body.image_url || null);

  Restaurant.createMenuItem(
    { restaurant_id: restaurantId, name, description, price, is_available, image_url },
    (err, menuItem) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }

      res.status(201).send({
        message: 'Menu item created successfully',
        menuItem,
      });
    }
  );
};

const getMenuItems = (req, res) => {
  Restaurant.getMenuItems(req.params.restaurantId, (err, menuItems) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    res.status(200).send(menuItems);
  });
};

const updateMenuItem = (req, res) => {
  const { name, description, price, is_available } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;

  Restaurant.updateMenuItem(req.params.itemId, { name, description, price, is_available, image_url }, (err, menuItem) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    if (!menuItem) {
      return res.status(404).send({ message: 'Menu item not found' });
    }

    res.status(200).send({
      message: 'Menu item updated successfully',
      menuItem,
    });
  });
};

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  getMyRestaurants,
  updateRestaurant,
  createMenuItem,
  getMenuItems,
  updateMenuItem,
};
