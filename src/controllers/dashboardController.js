const { User, Product, Order, OrderItem } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, totalOrders, revenueResult, totalProducts] = await Promise.all([
      User.count({ where: { isActive: true } }),
      Order.count(),
      Order.sum('total', { where: { status: 'delivered', createdAt: { [Op.gte]: startOfMonth } } }),
      Product.count({ where: { isActive: true } }),
    ]);

    res.json({
      totalUsers,
      totalOrders,
      totalRevenue: revenueResult || 0,
      totalProducts,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/top-products
const getTopProducts = async (req, res, next) => {
  try {
    const topProducts = await OrderItem.findAll({
      attributes: ['productId', [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold']],
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price', 'imageUrl'] }],
      group: ['productId', 'product.id'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit: 5,
    });
    res.json(topProducts);
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/recent-orders
const getRecentOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 10,
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getTopProducts, getRecentOrders };
