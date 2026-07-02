const { Order, OrderItem, Product, User, Coupon, CouponUsage } = require('../models');
const { sequelize } = require('../config/database');

// GET /api/orders/me
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{
        model: OrderItem, as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'imageUrl'] }],
      }],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders/:id
const getById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{
        model: OrderItem, as: 'items',
        include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'imageUrl', 'price'] }],
      }],
    });
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

// GET /api/orders (admin)
const getAll = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const orders = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: OrderItem, as: 'items',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
    });

    res.json({ orders: orders.rows, total: orders.count, page: Number(page) });
  } catch (error) {
    next(error);
  }
};

// POST /api/orders
const create = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { items, shippingAddress, couponCode } = req.body;
    const userId = req.user.id;

    if (!items?.length) return res.status(400).json({ message: 'El carrito está vacío' });

    // Calcular subtotal y verificar stock
    let subtotal = 0;
    const itemsWithPrice = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) throw new Error(`Producto ${item.productId} no encontrado`);
      if (product.stock < item.quantity) throw new Error(`Stock insuficiente para ${product.name}`);

      subtotal += Number(product.price) * item.quantity;
      itemsWithPrice.push({ productId: item.productId, quantity: item.quantity, unitPrice: product.price });
      await product.update({ stock: product.stock - item.quantity }, { transaction: t });
    }

    // Verificar si es primera compra
    const previousOrders = await Order.count({ where: { userId, paymentStatus: 'paid' } });
    const isFirstPurchase = previousOrders === 0;

    // Calcular descuento
    let discount = 0;
    let couponId = null;

    // Descuento automático primera compra (10%)
    if (isFirstPurchase) {
      discount = Math.round(subtotal * 0.10);
    }

    // Aplicar cupón si se envió
    if (couponCode) {
      const coupon = await Coupon.findOne({
        where: { code: couponCode.toUpperCase().trim(), isActive: true },
        transaction: t,
      });

      if (coupon) {
        const userUsages = await CouponUsage.count({
          where: { couponId: coupon.id, userId },
          transaction: t,
        });

        const couponValid =
          (!coupon.expiresAt || new Date() <= new Date(coupon.expiresAt)) &&
          (coupon.maxUses === null || coupon.usedCount < coupon.maxUses) &&
          userUsages < coupon.perUserLimit &&
          subtotal >= Number(coupon.minOrderAmount) &&
          (!coupon.isFirstPurchaseOnly || isFirstPurchase);

        if (couponValid) {
          const couponDiscount = coupon.type === 'percentage'
            ? Math.round((subtotal * Number(coupon.value)) / 100)
            : Math.min(Number(coupon.value), subtotal);

          // Tomar el mayor descuento entre primera compra y cupón
          if (couponDiscount > discount) {
            discount = couponDiscount;
            couponId = coupon.id;
            await coupon.update({ usedCount: coupon.usedCount + 1 }, { transaction: t });
          }
        }
      }
    }

    const total = Math.max(0, subtotal - discount);

    const order = await Order.create({
      userId,
      subtotal,
      discount,
      total,
      couponId,
      shippingAddress,
      isFirstPurchase,
      status: 'processing',
    }, { transaction: t });

    await OrderItem.bulkCreate(
      itemsWithPrice.map((i) => ({ ...i, orderId: order.id })),
      { transaction: t }
    );

    // Registrar uso del cupón
    if (couponId) {
      await CouponUsage.create({ couponId, userId, orderId: order.id }, { transaction: t });
    }

    await t.commit();

    const fullOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
    });

    res.status(201).json(fullOrder);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// PUT /api/orders/:id/status (admin)
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' });
    await order.update({ status });
    res.json(order);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyOrders, getById, getAll, create, updateStatus };
