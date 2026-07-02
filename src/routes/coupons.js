const router = require('express').Router();
const { validate, getAll, create, update, remove } = require('../controllers/couponController');
const { authenticate, isAdmin } = require('../middlewares/auth');

router.post('/validate', authenticate, validate);
router.get('/', authenticate, isAdmin, getAll);
router.post('/', authenticate, isAdmin, create);
router.put('/:id', authenticate, isAdmin, update);
router.delete('/:id', authenticate, isAdmin, remove);

module.exports = router;
