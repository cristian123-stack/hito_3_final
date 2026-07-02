const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CouponUsage = sequelize.define('CouponUsage', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  couponId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'coupons', key: 'id' },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'orders', key: 'id' },
  },
}, {
  tableName: 'coupon_usages',
  timestamps: true,
});

module.exports = CouponUsage;
