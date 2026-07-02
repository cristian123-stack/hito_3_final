const { Category, Product } = require('../models');

const getAll = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Product, as: 'products', attributes: ['id'], where: { isActive: true }, required: false }],
    });
    const result = categories.map((c) => ({
      ...c.toJSON(),
      productCount: c.products?.length || 0,
      products: undefined,
    }));
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json(category);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });
    await category.update(req.body);
    res.json(category);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: 'Categoría no encontrada' });
    await category.destroy();
    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };
