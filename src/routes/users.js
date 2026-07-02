const router = require('express').Router();
const { getAll, getById, update, remove } = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middlewares/auth');

router.get('/', authenticate, isAdmin, getAll);
router.get('/:id', authenticate, isAdmin, getById);
router.put('/:id', authenticate, isAdmin, update);
router.delete('/:id', authenticate, isAdmin, remove);

module.exports = router;
