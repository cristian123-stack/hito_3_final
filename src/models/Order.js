const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  status: {
    type: DataTypes.ENUM('processing', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'processing',
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  couponId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'coupons', key: 'id' },
  },
  shippingAddress: { type: DataTypes.TEXT, allowNull: true },
  paymentIntentId: { type: DataTypes.STRING, allowNull: true },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  isFirstPurchase: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'orders',
  timestamps: true,
});

module.exports = Order;
