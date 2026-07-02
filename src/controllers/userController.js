const { User, Order } = require('../models');

// GET /api/users (admin)
const getAll = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const where = {};
    if (role) where.role = role;

    const users = await User.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
    });

    res.json({ users: users.rows, total: users.count, page: Number(page) });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id (admin)
const getById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Order, as: 'orders', attributes: ['id', 'total', 'status', 'createdAt'] }],
    });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id (admin)
const update = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    await user.update(req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id (admin) — soft delete
const remove = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    await user.update({ isActive: false });
    res.json({ message: 'Usuario desactivado' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, update, remove };
