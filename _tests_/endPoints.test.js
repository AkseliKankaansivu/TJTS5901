const request = require('supertest');
const { app, closeServer, orders } = require('../index.js');

describe('GET /', () => {
  it('should return "Hello World!"', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('<h1>Hello World!</h1>');
    await closeServer();
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

describe('GET /api/orders/:id', () => {
  it('should return the order with the specified ID', async () => {
    const newOrder = {
      id: 1,
      order: "Offer",
      price: 165.00,
      quantity: 500
    };
    orders.push(newOrder);
    const orderId = 1;

    // Make a request to get the order with the specified ID
    const response = await request(app).get(`/api/orders/${orderId}`);

    // Check if the response status is 200
    expect(response.status).toBe(200);

    // Check if the response body contains the expected order with ID 1
    expect(response.body.id).toBe(orderId);
  });

  it('should return 404 if the order is not found', async () => {
    const orderId = 999;

    // Make a request to get the order with the specified ID
    const response = await request(app).get(`/api/orders/${orderId}`);

    // Check if the response status is 404
    expect(response.status).toBe(404);
  });
});

  afterAll(async () => {
    await closeServer();
    await new Promise(resolve => setTimeout(resolve, 2000));
});
