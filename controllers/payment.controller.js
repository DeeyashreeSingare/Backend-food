const Payment = require('../models/postgres/payment.model');

const getPaymentByOrderId = (req, res) => {
  Payment.findByOrderId(req.params.orderId, (err, payment) => {
    if (err) {
      return res.status(500).send({ message: err.message });
    }

    if (!payment) {
      return res.status(404).send({ message: 'Payment not found' });
    }

    res.status(200).send(payment);
  });
};

module.exports = {
  getPaymentByOrderId,
};
