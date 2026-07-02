const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

  // Error de validación Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: 'Error de validación',
      errors: err.errors.map((e) => e.message),
    });
  }

  // Error de constraint único
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      message: 'Ya existe un registro con esos datos',
      errors: err.errors.map((e) => e.message),
    });
  }

  // Error JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Token inválido' });
  }

  // Error genérico
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
  });
};

module.exports = errorHandler;
