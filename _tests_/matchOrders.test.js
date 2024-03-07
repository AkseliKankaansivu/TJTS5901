// Import necessary modules and functions
const { matchOrders, closeServer, orders, getTrades } = require('../index.js');

describe('Order Matching Logic', () => {
  beforeEach(() => {
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
  });

  it('matches a bid with an offer when prices match', () => {
    matchOrders();
    let trades = getTrades();
    // Assert that a trade has been created
    expect(trades.length).toBe(1);
    // Assert that the quantities of orders and trade are updated correctly
    expect(orders[1].quantity).toBe(500); // remaining Offer quantity
    expect(trades[0].quantity).toBe(500); // Trade quantity
  });
});

afterAll(async () => {
    await closeServer();
});
