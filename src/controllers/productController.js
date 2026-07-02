const { Product, Category } = require('../models');
const { Op } = require('sequelize');

// GET /api/products
const getAll = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, sort } = req.query;
    const where = { isActive: true };

    if (search) where.name = { [Op.iLike]: `%${search}%` };
    if (category) where['$category.name$'] = category;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }

    const order = [];
    if (sort === 'price-asc') order.push(['price', 'ASC']);
    else if (sort === 'price-desc') order.push(['price', 'DESC']);
    else if (sort === 'rating') order.push(['rating', 'DESC']);
    else order.push(['createdAt', 'DESC']);

    const products = await Product.findAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
      order,
    });

    res.json(products);
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id
const getById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, isActive: true },
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],
    });
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// POST /api/products (admin)
const create = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id (admin)
const update = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    await product.update(req.body);
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id (admin) — soft delete
const remove = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    await product.update({ isActive: false });
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };
