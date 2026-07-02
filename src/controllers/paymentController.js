const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Order } = require('../models');

// POST /api/payments/create-intent
const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency = 'clp' } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Monto inválido' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // CLP no tiene decimales
      currency,
      metadata: { userId: req.user.id },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    next(error);
  }
};

// POST /api/payments/confirm
const confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId, orderId } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'El pago no fue completado' });
    }

    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' });

    await order.update({ paymentIntentId, paymentStatus: 'paid', status: 'processing' });
    res.json({ message: 'Pago confirmado', order });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPaymentIntent, confirmPayment };
