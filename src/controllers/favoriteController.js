const { Favorite, Product } = require('../models');

// GET /api/favorites
const getAll = async (req, res, next) => {
  try {
    const favorites = await Favorite.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product, as: 'Product' }],
    });
    res.json(favorites.map((f) => f.Product));
  } catch (error) {
    next(error);
  }
};

// POST /api/favorites
const add = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    const [favorite, created] = await Favorite.findOrCreate({
      where: { userId: req.user.id, productId },
    });

    if (!created) return res.status(400).json({ message: 'Ya está en favoritos' });
    res.status(201).json({ message: 'Añadido a favoritos' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/favorites/:productId
const remove = async (req, res, next) => {
  try {
    const deleted = await Favorite.destroy({
      where: { userId: req.user.id, productId: req.params.productId },
    });
    if (!deleted) return res.status(404).json({ message: 'No encontrado en favoritos' });
    res.json({ message: 'Eliminado de favoritos' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, add, remove };
