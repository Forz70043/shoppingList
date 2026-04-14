const request = require('supertest');
const app = require('../server');
const { syncDatabase, closeDatabase } = require('./setup');

let token;
let listId;

const testUser = {
  name: 'List User',
  username: 'listuser',
  email: 'listuser@example.com',
  password: 'Password123!',
};

beforeAll(async () => {
  await syncDatabase();
  await request(app).post('/api/auth/signup').send(testUser);
  const res = await request(app).post('/api/auth/signin').send({
    email: testUser.email,
    password: testUser.password,
  });
  token = res.body.token;
});

afterAll(async () => {
  await closeDatabase();
});

const authHeader = () => ({ Authorization: `Bearer ${token}` });

describe('POST /api/lists', () => {
  it('should create a new list', async () => {
    const res = await request(app)
      .post('/api/lists')
      .set(authHeader())
      .send({ name: 'Groceries' });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Groceries');
    expect(res.body.id).toBeDefined();
    listId = res.body.id;
  });

  it('should reject without auth', async () => {
    const res = await request(app).post('/api/lists').send({ name: 'Nope' });
    expect(res.statusCode).toBe(401);
  });

  it('should reject empty list name', async () => {
    const res = await request(app)
      .post('/api/lists')
      .set(authHeader())
      .send({ name: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Validation error');
  });

  it('should reject missing list name', async () => {
    const res = await request(app)
      .post('/api/lists')
      .set(authHeader())
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});

describe('GET /api/lists', () => {
  it('should return user lists', async () => {
    const res = await request(app)
      .get('/api/lists')
      .set(authHeader());
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].name).toBe('Groceries');
  });

  it('should reject without auth', async () => {
    const res = await request(app).get('/api/lists');
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/lists/:id', () => {
  it('should return a specific list with items', async () => {
    const res = await request(app)
      .get(`/api/lists/${listId}`)
      .set(authHeader());
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Groceries');
    expect(res.body.items).toBeDefined();
  });

  it('should return 404 for non-existent list', async () => {
    const res = await request(app)
      .get('/api/lists/99999')
      .set(authHeader());
    expect(res.statusCode).toBe(404);
  });
});

describe('PUT /api/lists/:id', () => {
  it('should update list name', async () => {
    const res = await request(app)
      .put(`/api/lists/${listId}`)
      .set(authHeader())
      .send({ name: 'Weekly Groceries' });
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Weekly Groceries');
  });

  it('should return 404 for non-existent list', async () => {
    const res = await request(app)
      .put('/api/lists/99999')
      .set(authHeader())
      .send({ name: 'Ghost' });
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/lists/:listId/items', () => {
  it('should add an item to the list', async () => {
    const res = await request(app)
      .post(`/api/lists/${listId}/items`)
      .set(authHeader())
      .send({ name: 'Milk', quantity: 2 });
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Milk');
    expect(res.body.quantity).toBe(2);
    expect(Number(res.body.listId)).toBe(listId);
  });

  it('should add item with default quantity', async () => {
    const res = await request(app)
      .post(`/api/lists/${listId}/items`)
      .set(authHeader())
      .send({ name: 'Bread' });
    expect(res.statusCode).toBe(201);
    expect(res.body.quantity).toBe(1);
  });

  it('should reject for non-existent list', async () => {
    const res = await request(app)
      .post('/api/lists/99999/items')
      .set(authHeader())
      .send({ name: 'Nope' });
    expect(res.statusCode).toBe(404);
  });

  it('should reject empty item name', async () => {
    const res = await request(app)
      .post(`/api/lists/${listId}/items`)
      .set(authHeader())
      .send({ name: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Validation error');
  });

  it('should reject negative quantity', async () => {
    const res = await request(app)
      .post(`/api/lists/${listId}/items`)
      .set(authHeader())
      .send({ name: 'Bad', quantity: -1 });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors.some(e => e.field === 'quantity')).toBe(true);
  });
});

describe('GET /api/lists/:listId/items', () => {
  it('should return items for a list', async () => {
    const res = await request(app)
      .get(`/api/lists/${listId}/items`)
      .set(authHeader());
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  it('should reject for non-existent list', async () => {
    const res = await request(app)
      .get('/api/lists/99999/items')
      .set(authHeader());
    expect(res.statusCode).toBe(404);
  });
});

describe('GET /api/lists paginated', () => {
  it('should return paginated lists with meta', async () => {
    const res = await request(app)
      .get('/api/lists?page=1&limit=2')
      .set(authHeader());
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty('total');
    expect(res.body.meta).toHaveProperty('page', 1);
    expect(res.body.meta).toHaveProperty('limit', 2);
    expect(res.body.meta).toHaveProperty('totalPages');
  });
});

describe('GET /api/lists/:listId/items paginated', () => {
  it('should return paginated items with meta', async () => {
    // Add some items
    await request(app)
      .post(`/api/lists/${listId}/items`)
      .set(authHeader())
      .send({ name: 'Milk', quantity: 1 });
    await request(app)
      .post(`/api/lists/${listId}/items`)
      .set(authHeader())
      .send({ name: 'Bread', quantity: 2 });
    const res = await request(app)
      .get(`/api/lists/${listId}/items?page=1&limit=1`)
      .set(authHeader());
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty('total');
    expect(res.body.meta).toHaveProperty('page', 1);
    expect(res.body.meta).toHaveProperty('limit', 1);
    expect(res.body.meta).toHaveProperty('totalPages');
  });
});

describe('DELETE /api/lists/:id', () => {
  it('should delete a list', async () => {
    // Create a list to delete
    const created = await request(app)
      .post('/api/lists')
      .set(authHeader())
      .send({ name: 'To Delete' });
    const res = await request(app)
      .delete(`/api/lists/${created.body.id}`)
      .set(authHeader());
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);

    // Verify it's gone
    const check = await request(app)
      .get(`/api/lists/${created.body.id}`)
      .set(authHeader());
    expect(check.statusCode).toBe(404);
  });

  it('should return 404 for non-existent list', async () => {
    const res = await request(app)
      .delete('/api/lists/99999')
      .set(authHeader());
    expect(res.statusCode).toBe(404);
  });
});

describe('Cross-user isolation', () => {
  let otherToken;

  beforeAll(async () => {
    await request(app).post('/api/auth/signup').send({
      name: 'Other User',
      username: 'otheruser',
      email: 'other@example.com',
      password: 'Password123!',
    });
    const res = await request(app).post('/api/auth/signin').send({
      email: 'other@example.com',
      password: 'Password123!',
    });
    otherToken = res.body.token;
  });

  it('should not return another user\'s lists', async () => {
    const res = await request(app)
      .get('/api/lists')
      .set({ Authorization: `Bearer ${otherToken}` });
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(0);
  });

  it('should not access another user\'s list by id', async () => {
    const res = await request(app)
      .get(`/api/lists/${listId}`)
      .set({ Authorization: `Bearer ${otherToken}` });
    expect(res.statusCode).toBe(404);
  });
});
