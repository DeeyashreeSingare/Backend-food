const Order = require('../models/postgres/order.model');
const Payment = require('../models/postgres/payment.model');
const Restaurant = require('../models/postgres/restaurant.model');
const Notification = require('../models/mongodb/notification.model');
const { emitOrderUpdate, emitNotification, emitToRole } = require('../utils/socket');

const createOrder = (req, res) => {
  const { restaurant_id, items, total_amount, delivery_address, payment_method } = req.body;

  Order.create(
    {
      user_id: req.userId,
      restaurant_id,
      items,
      total_amount,
      delivery_address,
      status: 'pending',
    },
    (err, order) => {
      if (err) {
        return res.status(500).send({ message: err.message });
      }

      // Create payment
      Payment.create(
        {
          order_id: order.id,
          amount: total_amount,
          payment_method: payment_method || 'dummy',
          status: 'pending',
          transaction_id: `TXN-${Date.now()}-${order.id}`,
        },
        (paymentErr, payment) => {
          if (paymentErr) {
            return res.status(500).send({ message: paymentErr.message });
          }

          // Process dummy payment
          Payment.updateStatus(
            payment.id,
            'completed',
            payment.transaction_id,
            (updateErr, updatedPayment) => {
              if (updateErr) {
                return res.status(500).send({ message: updateErr.message });
              }

              // Update order status
              Order.updateStatus(order.id, 'confirmed', (orderErr, updatedOrder) => {
                if (orderErr) {
                  return res.status(500).send({ message: orderErr.message });
                }

                // Create notification for user
                Notification.create(
                  {
                    user_id: req.userId,
                    type: 'order_confirmed',
                    title: 'Order Confirmed',
                    message: `Your order #${order.id} has been confirmed and payment processed`,
                    order_id: order.id,
                  },
                  (err, notification) => {
                    if (err) console.error('Error creating user notification:', err);
                    const io = req.app.get('io');
                    if (io && !err && notification) {
                      console.log('Emitting order_confirmed notification for user:', req.userId);
                      emitNotification(io, notification);
                    }
                  }
                );

                // Get restaurant owner_id and create notification for restaurant
                Restaurant.findById(order.restaurant_id, (restErr, restaurant) => {
                  if (!restErr && restaurant && restaurant.owner_id) {
                    Notification.create(
                      {
                        user_id: restaurant.owner_id,
                        type: 'new_order',
                        title: 'New Order Received',
                        message: `You have a new order #${order.id} for ₹${order.total_amount}`,
                        order_id: order.id,
                      },
                      (err, notification) => {
                        if (err) console.error('Error creating restaurant notification:', err);
                        const io = req.app.get('io');
                        if (io && !err && notification) {
                          console.log('Emitting new_order notification for restaurant owner:', restaurant.owner_id);
                          emitNotification(io, notification);
                          io.to(`user_${restaurant.owner_id}`).emit('order_update', updatedOrder);
                        }
                      }
                    );
                  }
                });

                // Emit Socket.IO event
                const io = req.app.get('io');
                if (io) {
                  emitOrderUpdate(io, updatedOrder);
                }

                res.status(201).send({
                  message: 'Order created and payment processed',
                  order: updatedOrder,
                  payment: updatedPayment,
                });
              });
            }
          );
        }
      );
    }
  );
};

const getOrderById = (req, res) => {
  Order.findById(req.params.id, (err, order) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    if (!order) {
      return res.status(404).send({ message: 'Order not found' });
    }

    // Check authorization
    if (order.user_id !== req.userId && order.restaurant_id !== req.userId && order.rider_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).send({ message: 'Access denied' });
    }

    res.status(200).send(order);
  });
};

const getMyOrders = (req, res) => {
  Order.findByUserId(req.userId, (err, orders) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    res.status(200).send(orders);
  });
};

const getRestaurantOrders = (req, res) => {
  Order.findByRestaurantId(req.params.restaurantId, (err, orders) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    res.status(200).send(orders);
  });
};

const updateOrderStatus = (req, res) => {
  const { status } = req.body;

  Order.updateStatus(req.params.id, status, (err, order) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    if (!order) {
      return res.status(404).send({ message: 'Order not found' });
    }

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) {
      emitOrderUpdate(io, order);

      // Create notification for user with status-specific messages
      const statusMessages = {
        'preparing': `Your order #${order.id} is being prepared`,
        'ready': `Your order #${order.id} is ready for pickup`,
        'out_for_delivery': `Your order #${order.id} is out for delivery`,
        'delivered': `Your order #${order.id} has been delivered! Enjoy your meal!`,
        'cancelled': `Your order #${order.id} has been cancelled`
      };

      const userMessage = statusMessages[status] || `Your order #${order.id} status has been updated to ${status}`;

      Notification.create(
        {
          user_id: order.user_id,
          type: 'order_status_updated',
          title: 'Order Status Updated',
          message: userMessage,
          order_id: order.id,
        },
        (err, notification) => {
          if (err) {
            console.error('Error creating notification in updateOrderStatus:', err);
            return;
          }
          if (notification) {
            emitNotification(io, notification);
          }
        }
      );

      // If status is ready, notify all riders
      if (status === 'ready') {
        Notification.create(
          {
            user_id: null, // Global notification
            role_target: 'rider',
            type: 'order_available',
            title: 'New Order Available',
            message: `Order #${order.id} is ready for pickup!`,
            order_id: order.id,
          },
          (err, notification) => {
            if (!err && notification) {
              emitToRole(io, 'rider', 'new_notification', notification);
            }
          }
        );
      }
    }

    res.status(200).send({
      message: 'Order status updated successfully',
      order,
    });
  });
};

const getAvailableOrders = (req, res) => {
  Order.findAvailableForRider((err, orders) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    res.status(200).send(orders);
  });
};

const acceptOrder = (req, res) => {
  Order.assignRider(req.params.id, req.userId, (err, order) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    if (!order) {
      return res.status(404).send({ message: 'Order not found or already assigned' });
    }

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) {
      emitOrderUpdate(io, order);

      // Create notifications
      Notification.create(
        {
          user_id: order.user_id,
          type: 'order_assigned',
          title: 'Order Assigned',
          message: `Your order #${order.id} has been assigned to a rider`,
          order_id: order.id,
        },
        (err, notification) => {
          if (err) console.error('Error creating notification in acceptOrder (user):', err);
          if (!err && notification) emitNotification(io, notification);
        }
      );

      Notification.create(
        {
          user_id: order.restaurant_id,
          type: 'order_assigned',
          title: 'Order Assigned',
          message: `Order #${order.id} has been assigned to a rider`,
          order_id: order.id,
        },
        (err, notification) => {
          if (err) console.error('Error creating notification in acceptOrder (restaurant):', err);
          if (!err && notification) emitNotification(io, notification);
        }
      );
    }

    res.status(200).send({
      message: 'Order accepted successfully',
      order,
    });
  });
};

const updateRiderStatus = (req, res) => {
  const { status } = req.body;

  Order.updateRiderStatus(req.params.id, req.userId, status, (err, order) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    if (!order) {
      return res.status(404).send({ message: 'Order not found or not assigned to you' });
    }

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) {
      emitOrderUpdate(io, order);

      // Create notification for user with status-specific messages
      const statusMessages = {
        'picked_up': `Your order #${order.id} has been picked up by the rider`,
        'on_the_way': `Your order #${order.id} is on the way to you`,
        'delivered': `Your order #${order.id} has been delivered! Enjoy your meal!`
      };

      const userMessage = statusMessages[status] || `Your order #${order.id} status: ${status}`;

      Notification.create(
        {
          user_id: order.user_id,
          type: 'order_status_updated',
          title: 'Order Status Updated',
          message: userMessage,
          order_id: order.id,
        },
        (err, notification) => {
          if (!err && notification) emitNotification(io, notification);
        }
      );
    }

    res.status(200).send({
      message: 'Order status updated successfully',
      order,
    });
  });
};

const getRiderOrders = (req, res) => {
  Order.findByRiderId(req.userId, (err, orders) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    res.status(200).send(orders);
  });
};

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getRestaurantOrders,
  updateOrderStatus,
  getAvailableOrders,
  acceptOrder,
  updateRiderStatus,
  getRiderOrders,
};
