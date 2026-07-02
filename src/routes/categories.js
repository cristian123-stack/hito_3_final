const router = require('express').Router();
const { getAll, getById, create, update, remove } = require('../controllers/categoryController');
const { authenticate, isAdmin } = require('../middlewares/auth');

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', authenticate, isAdmin, create);
router.put('/:id', authenticate, isAdmin, update);
router.delete('/:id', authenticate, isAdmin, remove);

module.exports = router;
