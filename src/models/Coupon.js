const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Coupon = sequelize.define('Coupon', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    set(val) { this.setDataValue('code', val.toUpperCase().trim()); },
  },
  type: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: false,
    defaultValue: 'percentage',
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  minOrderAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  maxUses: {
    type: DataTypes.INTEGER,
    allowNull: true, // null = ilimitado
  },
  usedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  perUserLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 1, // 1 = un uso por usuario
  },
  isFirstPurchaseOnly: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'coupons',
  timestamps: true,
});

module.exports = Coupon;
