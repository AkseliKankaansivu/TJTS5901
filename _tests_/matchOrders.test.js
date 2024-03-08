// Import necessary modules and functions
const { matchOrders, closeServer, orders, getTrades } = require('../index.js');

describe('Order Matching Logic', () => {
  it('matches a bid with an offer when prices match', () => {
    const newOrder = {
      id: 1,
      order: "Bid",
      price: 165.00,
      quantity: 500
    };
    const newOrder2 = {
      id: 2,
      order: "Offer",
      price: 165.00,
      quantity: 1000
    };
  orders.push(newOrder, newOrder2);
    matchOrders();
    let trades = getTrades();
    // Assert that a trade has been created
    expect(trades.length).toBe(1);
    // Assert that the quantities of orders and trade are updated correctly
    expect(orders[1].quantity).toBe(500); // remaining Offer quantity
    expect(trades[0].quantity).toBe(500); // Trade quantity
  })
  it('doesnt match when prices dont match', () => {
    const newOrder = {
      id: 3,
      order: "Bid",
      price: 100.00,
      quantity: 500
    };
    const newOrder2 = {
      id: 4,
      order: "Offer",
      price: 800.00,
      quantity: 1000
    };
  orders.push(newOrder, newOrder2);
    matchOrders();
    let trades = getTrades();
    // Assert that trade array is same as before
    expect(trades.length).toBe(1);
    // Assert that the quantities of orders and trade are updated correctly
  });
});

afterAll(async () => {
    await closeServer();
    await new Promise(resolve => setTimeout(resolve, 2000));
});
