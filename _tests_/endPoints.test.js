const request = require('supertest');
const { app, closeServer } = require('../index.js');

describe('GET /', () => {
  it('should return "Hello World!"', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('<h1>Hello World!</h1>');
  });
});

describe('GET /api/trades', () => {
  it('should return an array of trades', async () => {
    const response = await request(app).get('/api/trades');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('GET /api/orders', () => {
  it('should return an array of orders', async () => {
    const response = await request(app).get('/api/orders');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

  afterAll(async () => {
    await closeServer();
});
