const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'El correo ya está registrado' });

    const user = await User.create({ name, email, password });
    const token = generateToken(user);

    res.status(201).json({ user, token });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: 'Credenciales inválidas' });

    if (!user.isActive) return res.status(401).json({ message: 'Cuenta desactivada' });

    const token = generateToken(user);
    res.json({ user, token });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getProfile = async (req, res) => {
  res.json(req.user);
};

// PUT /api/auth/me
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, password } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;
    if (password) updates.password = password;

    await req.user.update(updates);
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile };
