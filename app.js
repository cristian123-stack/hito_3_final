require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./src/middlewares/errorHandler');

require('./src/models');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/categories', require('./src/routes/categories'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/favorites', require('./src/routes/favorites'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/payments', require('./src/routes/payments'));
app.use('/api/coupons', require('./src/routes/coupons'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Pet Store API funcionando 🐾' });
});

app.use((req, res) => {
  res.status(404).json({ message: `Ruta ${req.method} ${req.url} no encontrada` });
});

app.use(errorHandler);

module.exports = app;
