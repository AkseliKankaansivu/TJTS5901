// Import necessary modules and functions
const request = require('supertest');
const { app, closeServer, getData } = require('../index.js');

beforeAll(async () => {
  await closeServer();
});

describe('POST /api/orders', () => {
    it('should return 400 if required information is missing', async () => {
        const response = await request(app)
        .post('/api/orders')
        .send({});
  
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'missing critical information' });
    });

    it('should return 400 if order price is outside the price margin', async () => {
        require('../index.js').lastPrice = 100; // For example

        const response = await request(app)
          .post('/api/orders')
          .send({ order: 'Bid', price: 150, quantity: 100 });
    
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'order price is outside of the price margin' });
    });
    it('should return 200 if the order is succesfully processed', async () => {
      getData();
      await new Promise(resolve => setTimeout(resolve, 2000));
      let { lastPrice } = require('../index.js');
      await new Promise(resolve => setTimeout(resolve, 1000));
        const response = await request(app)
          .post('/api/orders')
          .send({ order: 'Bid', price: lastPrice, quantity: 100 });

        expect(response.status).toBe(200);
    })
});
afterAll(async () => {
    await closeServer();
    await new Promise(resolve => setTimeout(resolve, 2000));
});
