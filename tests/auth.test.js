const request = require('supertest');
const app = require('../server');
const { syncDatabase, closeDatabase } = require('./setup');

beforeAll(async () => {
  await syncDatabase();
});

afterAll(async () => {
  await closeDatabase();
});

const testUser = {
  name: 'Test User',
  username: 'testuser',
  email: 'test@example.com',
  password: 'Password123!',
};

describe('POST /api/auth/signup', () => {
  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/signup').send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/successfully/i);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.roles).toContain('user');
    // password should not be returned in plain text
    expect(res.body.user.password).not.toBe(testUser.password);
  });

  it('should reject duplicate email', async () => {
    const res = await request(app).post('/api/auth/signup').send(testUser);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already in use/i);
  });

  it('should reject missing fields', async () => {
    const res = await request(app).post('/api/auth/signup').send({ email: 'a@b.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/mandatory/i);
  });
});

describe('POST /api/auth/signin', () => {
  it('should login with valid credentials', async () => {
    const res = await request(app).post('/api/auth/signin').send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    // should set httpOnly cookie
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some(c => c.includes('token='))).toBe(true);
  });

  it('should reject wrong password', async () => {
    const res = await request(app).post('/api/auth/signin').send({
      email: testUser.email,
      password: 'WrongPassword',
    });
    expect(res.statusCode).toBe(400);
  });

  it('should reject non-existent email', async () => {
    const res = await request(app).post('/api/auth/signin').send({
      email: 'nobody@example.com',
      password: 'Password123!',
    });
    expect(res.statusCode).toBe(400);
  });

  it('should reject missing fields', async () => {
    const res = await request(app).post('/api/auth/signin').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/mandatory/i);
  });
});

describe('GET /api/auth/me', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/signin').send({
      email: testUser.email,
      password: testUser.password,
    });
    token = res.body.token;
  });

  it('should return current user with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(testUser.email);
    expect(res.body.roles).toBeDefined();
  });

  it('should reject without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('should reject invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken123');
    expect(res.statusCode).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('should clear token cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/logged out/i);
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    // cookie should be cleared (empty value or expired)
    expect(cookies.some(c => c.includes('token='))).toBe(true);
  });
});
