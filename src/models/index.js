const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Favorite = require('./Favorite');
const Coupon = require('./Coupon');
const CouponUsage = require('./CouponUsage');

// ---- Asociaciones ----
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

User.belongsToMany(Product, { through: Favorite, foreignKey: 'userId', as: 'favorites' });
Product.belongsToMany(User, { through: Favorite, foreignKey: 'productId', as: 'favoritedBy' });
Favorite.belongsTo(User, { foreignKey: 'userId' });
Favorite.belongsTo(Product, { foreignKey: 'productId' });

// Cupones
Coupon.hasMany(CouponUsage, { foreignKey: 'couponId', as: 'usages' });
CouponUsage.belongsTo(Coupon, { foreignKey: 'couponId', as: 'coupon' });
CouponUsage.belongsTo(User, { foreignKey: 'userId', as: 'user' });
CouponUsage.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Cupón en Order
Order.belongsTo(Coupon, { foreignKey: 'couponId', as: 'coupon' });
Coupon.hasMany(Order, { foreignKey: 'couponId', as: 'orders' });

module.exports = { User, Category, Product, Order, OrderItem, Favorite, Coupon, CouponUsage };
