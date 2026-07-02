const { Coupon, CouponUsage, Order } = require('../models');
const { Op } = require('sequelize');

// POST /api/coupons/validate — validar cupón antes de pagar
const validate = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;
    const userId = req.user.id;

    const coupon = await Coupon.findOne({
      where: { code: code.toUpperCase().trim(), isActive: true },
    });

    if (!coupon) return res.status(404).json({ message: 'Cupón no válido' });

    // Verificar expiración
    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      return res.status(400).json({ message: 'El cupón ha expirado' });
    }

    // Verificar límite de usos totales
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ message: 'El cupón ha alcanzado su límite de usos' });
    }

    // Verificar monto mínimo
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `El monto mínimo para este cupón es $${Number(coupon.minOrderAmount).toLocaleString('es-CL')}`,
      });
    }

    // Verificar usos por usuario
    const userUsages = await CouponUsage.count({
      where: { couponId: coupon.id, userId },
    });
    if (userUsages >= coupon.perUserLimit) {
      return res.status(400).json({ message: 'Ya utilizaste este cupón' });
    }

    // Verificar si es solo primera compra
    if (coupon.isFirstPurchaseOnly) {
      const hasOrders = await Order.count({ where: { userId, paymentStatus: 'paid' } });
      if (hasOrders > 0) {
        return res.status(400).json({ message: 'Este cupón es solo para la primera compra' });
      }
    }

    // Calcular descuento
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = Math.round((orderAmount * Number(coupon.value)) / 100);
    } else {
      discount = Math.min(Number(coupon.value), orderAmount);
    }

    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
      discount,
      finalAmount: orderAmount - discount,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/coupons (admin)
const getAll = async (req, res, next) => {
  try {
    const coupons = await Coupon.findAll({ order: [['createdAt', 'DESC']] });
    res.json(coupons);
  } catch (error) {
    next(error);
  }
};

// POST /api/coupons (admin)
const create = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (error) {
    next(error);
  }
};

// PUT /api/coupons/:id (admin)
const update = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Cupón no encontrado' });
    await coupon.update(req.body);
    res.json(coupon);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/coupons/:id (admin)
const remove = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Cupón no encontrado' });
    await coupon.update({ isActive: false });
    res.json({ message: 'Cupón desactivado' });
  } catch (error) {
    next(error);
  }
};

module.exports = { validate, getAll, create, update, remove };
