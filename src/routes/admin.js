const router = require('express').Router();
const { getStats, getTopProducts, getRecentOrders } = require('../controllers/dashboardController');
const { authenticate, isAdmin } = require('../middlewares/auth');

router.get('/stats', authenticate, isAdmin, getStats);
router.get('/top-products', authenticate, isAdmin, getTopProducts);
router.get('/recent-orders', authenticate, isAdmin, getRecentOrders);

module.exports = router;
