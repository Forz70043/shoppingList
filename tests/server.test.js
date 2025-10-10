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
