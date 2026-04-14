const request = require('supertest');
const app = require('../server');
const { syncDatabase, closeDatabase } = require('./setup');

let token;
let otherToken;
let listId;
let itemId;

const testUser = {
  name: 'Item User',
  username: 'itemuser',
  email: 'itemuser@example.com',
  password: 'Password123!',
};

beforeAll(async () => {
  await syncDatabase();

  // Create and sign in main user
  await request(app).post('/api/auth/signup').send(testUser);
  const login = await request(app).post('/api/auth/signin').send({
    email: testUser.email,
    password: testUser.password,
  });
  token = login.body.token;

  // Create a list and an item
  const list = await request(app)
    .post('/api/lists')
    .set({ Authorization: `Bearer ${token}` })
    .send({ name: 'Test List' });
  listId = list.body.id;

  const item = await request(app)
    .post(`/api/lists/${listId}/items`)
    .set({ Authorization: `Bearer ${token}` })
    .send({ name: 'Apples', quantity: 3 });
  itemId = item.body.id;

  // Create another user
  await request(app).post('/api/auth/signup').send({
    name: 'Other',
    username: 'otheritem',
    email: 'otheritem@example.com',
    password: 'Password123!',
  });
  const other = await request(app).post('/api/auth/signin').send({
    email: 'otheritem@example.com',
    password: 'Password123!',
  });
  otherToken = other.body.token;
});

afterAll(async () => {
  await closeDatabase();
});

describe('DELETE /api/items/:id', () => {
  it('should delete own item', async () => {
    // Create an extra item to delete
    const created = await request(app)
      .post(`/api/lists/${listId}/items`)
      .set({ Authorization: `Bearer ${token}` })
      .send({ name: 'Bananas' });

    const res = await request(app)
      .delete(`/api/items/${created.body.id}`)
      .set({ Authorization: `Bearer ${token}` });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  it('should reject deleting another user\'s item', async () => {
    const res = await request(app)
      .delete(`/api/items/${itemId}`)
      .set({ Authorization: `Bearer ${otherToken}` });
    expect(res.statusCode).toBe(403);
  });

  it('should return 404 for non-existent item', async () => {
    const res = await request(app)
      .delete('/api/items/99999')
      .set({ Authorization: `Bearer ${token}` });
    expect(res.statusCode).toBe(404);
  });

  it('should reject without auth', async () => {
    const res = await request(app).delete(`/api/items/${itemId}`);
    expect(res.statusCode).toBe(401);
  });
});
