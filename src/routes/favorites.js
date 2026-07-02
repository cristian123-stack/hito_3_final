const router = require('express').Router();
const { getAll, add, remove } = require('../controllers/favoriteController');
const { authenticate } = require('../middlewares/auth');

router.get('/', authenticate, getAll);
router.post('/', authenticate, add);
router.delete('/:productId', authenticate, remove);

module.exports = router;
