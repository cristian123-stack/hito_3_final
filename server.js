require('dotenv').config();
const app = require('./app');
const { connectDB, sequelize } = require('./src/config/database');

const PORT = process.env.PORT || 3001;

const start = async () => {
  await connectDB();
  await sequelize.sync({ alter: true });
  console.log('✅ Modelos sincronizados con la base de datos');
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  });
};

start();
