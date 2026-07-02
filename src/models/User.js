const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: { msg: 'El nombre es requerido' } },
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: { msg: 'El correo ya está registrado' },
    validate: { isEmail: { msg: 'Correo inválido' } },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { len: { args: [6, 100], msg: 'Mínimo 6 caracteres' } },
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 10);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
});

// Método para verificar contraseña
User.prototype.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// No devolver password en JSON
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;
