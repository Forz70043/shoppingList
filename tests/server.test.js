const request = require('supertest');

// Import server instance
const app = require('../server');

// Test base route
describe('GET /', () => {
  it('should return API message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('API Grocery List');
  });
});

// Health check endpoint
describe('GET /health', () => {
  it('should return health status and info', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('database');
  });
});
