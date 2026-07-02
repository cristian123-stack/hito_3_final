const router = require('express').Router();
const { getMyOrders, getById, getAll, create, updateStatus } = require('../controllers/orderController');
const { authenticate, isAdmin } = require('../middlewares/auth');

router.get('/me', authenticate, getMyOrders);
router.post('/', authenticate, create);
router.get('/:id', authenticate, getById);
router.get('/', authenticate, isAdmin, getAll);
router.put('/:id/status', authenticate, isAdmin, updateStatus);

module.exports = router;
