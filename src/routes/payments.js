const router = require('express').Router();
const { createPaymentIntent, confirmPayment } = require('../controllers/paymentController');
const { authenticate } = require('../middlewares/auth');

router.post('/create-intent', authenticate, createPaymentIntent);
router.post('/confirm', authenticate, confirmPayment);

module.exports = router;
