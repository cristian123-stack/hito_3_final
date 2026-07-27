const { Product, Category } = require('../models');
const { Op } = require('sequelize');

// GET /api/products
const getAll = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, sort } = req.query;
    const where = { isActive: true };

    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    // Configuración del Include de Categoría
    const categoryInclude = {
      model: Category,
      as: 'category',
      attributes: ['id', 'name'],
      required: false, // 👈 Importante: asegura que traiga los productos incluso si no tienen categoría asignada
    };

    // Si filtran por categoría desde el backend
    if (category && category !== 'Todos') {
      categoryInclude.where = {
        name: { [Op.iLike]: category } // Hace la búsqueda insensible a mayúsculas/minúsculas
      };
      // Si se filtra por categoría específica, requerimos que exista la relación
      categoryInclude.required = true; 
    }

    if (minPrice || maxPrice) {
      where.price = {};

      if (minPrice) {
        where.price[Op.gte] = minPrice;
      }

      if (maxPrice) {
        where.price[Op.lte] = maxPrice;
      }
    }

    const order = [];

    if (sort === 'price-asc') {
      order.push(['price', 'ASC']);
    } else if (sort === 'price-desc') {
      order.push(['price', 'DESC']);
    } else if (sort === 'rating') {
      order.push(['rating', 'DESC']);
    } else {
      order.push(['createdAt', 'DESC']);
    }

    const products = await Product.findAll({
      where,
      include: [categoryInclude],
      order,
    });

    // Convertir precios DECIMAL de Sequelize a números sin .00
    const formattedProducts = products.map((product) => {
      const data = product.toJSON();

      return {
        ...data,
        price: Number(data.price),
        originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
      };
    });

    res.json(formattedProducts);
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id
const getById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      where: { 
        id: req.params.id, 
        isActive: true 
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
          required: false
        }
      ],
    });

    if (!product) {
      return res.status(404).json({ 
        message: 'Producto no encontrado' 
      });
    }

    const data = product.toJSON();

    res.json({
      ...data,
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : null
    });

  } catch (error) {
    next(error);
  }
};

// POST /api/products (admin)
const create = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    const data = product.toJSON();

    res.status(201).json({
      ...data,
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : null
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/products/:id (admin)
const update = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Producto no encontrado'
      });
    }

    await product.update(req.body);
    const data = product.toJSON();

    res.json({
      ...data,
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : null
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/products/:id (admin)
const remove = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Producto no encontrado'
      });
    }

    await product.update({
      isActive: false
    });

    res.json({
      message: 'Producto eliminado correctamente'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};