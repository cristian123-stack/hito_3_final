# 🐾 Pet Store — Backend API

API REST desarrollada con Express, PostgreSQL y Sequelize.

## 🚀 Instalación

```bash
npm install
```

Crea tu archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Completa las variables en `.env` con tus datos de PostgreSQL y Stripe.

## ▶️ Ejecución

```bash
npm run dev    # Desarrollo con nodemon
npm start      # Producción
```

## 📋 Endpoints

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | /api/auth/register | Registro | — |
| POST | /api/auth/login | Login | — |
| GET | /api/auth/me | Perfil propio | ✅ |
| PUT | /api/auth/me | Actualizar perfil | ✅ |
| GET | /api/products | Listar productos | — |
| GET | /api/products/:id | Detalle producto | — |
| POST | /api/products | Crear producto | Admin |
| PUT | /api/products/:id | Editar producto | Admin |
| DELETE | /api/products/:id | Eliminar producto | Admin |
| GET | /api/categories | Listar categorías | — |
| POST | /api/categories | Crear categoría | Admin |
| PUT | /api/categories/:id | Editar categoría | Admin |
| DELETE | /api/categories/:id | Eliminar categoría | Admin |
| GET | /api/orders/me | Mis pedidos | ✅ |
| POST | /api/orders | Crear pedido | ✅ |
| GET | /api/orders | Todos los pedidos | Admin |
| PUT | /api/orders/:id/status | Cambiar estado | Admin |
| GET | /api/favorites | Mis favoritos | ✅ |
| POST | /api/favorites | Añadir favorito | ✅ |
| DELETE | /api/favorites/:productId | Quitar favorito | ✅ |
| GET | /api/users | Listar usuarios | Admin |
| PUT | /api/users/:id | Editar usuario | Admin |
| DELETE | /api/users/:id | Desactivar usuario | Admin |
| GET | /api/admin/stats | Estadísticas | Admin |
| GET | /api/admin/top-products | Más vendidos | Admin |
| GET | /api/admin/recent-orders | Pedidos recientes | Admin |
| POST | /api/payments/create-intent | Crear pago Stripe | ✅ |
| POST | /api/payments/confirm | Confirmar pago | ✅ |
| GET | /api/health | Estado del servidor | — |

## 🗄️ Base de datos

Tablas que se crean automáticamente al iniciar:
- `users`
- `categories`
- `products`
- `orders`
- `order_items`
- `favorites`
