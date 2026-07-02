const request = require('supertest');
const app = require('../app');

let token = '';
let adminToken = '';
let productId = null;

// ---- AUTH ----
describe('POST /api/auth/register', () => {
  it('debe registrar un nuevo usuario correctamente', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: `test_${Date.now()}@test.com`, password: '123456' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    token = res.body.token;
  });

  it('debe fallar si el correo ya está registrado', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin', email: 'admin@petstore.com', password: '123456' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('debe fallar si faltan campos requeridos', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'incompleto@test.com' });
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('debe iniciar sesión correctamente con credenciales válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@petstore.com', password: 'Cholita9$' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    adminToken = res.body.token;
  });

  it('debe fallar con contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@petstore.com', password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
  });

  it('debe fallar si el usuario no existe', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@test.com', password: '123456' });
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('debe retornar el perfil del usuario autenticado', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email');
    expect(res.body).not.toHaveProperty('password');
  });

  it('debe fallar sin token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('debe fallar con token inválido', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token_invalido');
    expect(res.statusCode).toBe(401);
  });
});

// ---- PRODUCTOS ----
describe('GET /api/products', () => {
  it('debe retornar lista de productos', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('debe filtrar por categoría', async () => {
    const res = await request(app).get('/api/products?category=Perros');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/products', () => {
  it('debe crear un producto siendo admin', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Producto Test', description: 'Descripción test', price: 9990, stock: 10, category: 'Perros' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    productId = res.body.id;
  });

  it('debe fallar sin autenticación', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Test', price: 1000 });
    expect(res.statusCode).toBe(401);
  });

  it('debe fallar si un usuario normal intenta crear producto', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test', description: 'Test', price: 1000, stock: 5, category: 'Perros' });
    expect(res.statusCode).toBe(403);
  });
});

describe('GET /api/products/:id', () => {
  it('debe retornar un producto por id', async () => {
    if (!productId) return;
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', productId);
  });

  it('debe retornar 404 si el producto no existe', async () => {
    const res = await request(app).get('/api/products/999999');
    expect(res.statusCode).toBe(404);
  });
});

describe('PUT /api/products/:id', () => {
  it('debe actualizar un producto siendo admin', async () => {
    if (!productId) return;
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Producto Actualizado', price: 14990 });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Producto Actualizado');
  });
});

describe('DELETE /api/products/:id', () => {
  it('debe eliminar un producto siendo admin', async () => {
    if (!productId) return;
    const res = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});

// ---- CATEGORÍAS ----
describe('GET /api/categories', () => {
  it('debe retornar lista de categorías', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /api/categories', () => {
  it('debe crear una categoría siendo admin', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: `CatTest_${Date.now()}`, icon: 'pets' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('debe fallar sin autenticación', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({ name: 'Test', icon: 'pets' });
    expect(res.statusCode).toBe(401);
  });
});

// ---- PEDIDOS ----
describe('GET /api/orders/me', () => {
  it('debe retornar pedidos del usuario autenticado', async () => {
    const res = await request(app)
      .get('/api/orders/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('debe fallar sin token', async () => {
    const res = await request(app).get('/api/orders/me');
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/orders (admin)', () => {
  it('debe retornar todos los pedidos siendo admin', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('debe fallar si un usuario normal intenta ver todos los pedidos', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
  });
});

// ---- FAVORITOS ----
describe('GET /api/favorites', () => {
  it('debe retornar favoritos del usuario autenticado', async () => {
    const res = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('debe fallar sin token', async () => {
    const res = await request(app).get('/api/favorites');
    expect(res.statusCode).toBe(401);
  });
});

// ---- CUPONES ----
describe('POST /api/coupons/validate', () => {
  it('debe fallar con cupón inexistente', async () => {
    const res = await request(app)
      .post('/api/coupons/validate')
      .set('Authorization', `Bearer ${token}`)
      .send({ code: 'INVALIDO123', orderAmount: 10000 });
    expect(res.statusCode).toBe(404);
  });
});

// ---- HEALTH CHECK ----
describe('GET /api/health', () => {
  it('debe retornar estado ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
