const assert = require('assert');
const { Given, When, Then } = require('cucumber');
const request = require('supertest');
const { app, orders, closeServer, getTrades, matchOrders, isPriceWithinRange, getData } = require('../../index.js');

let id = 1;

Given('the trading application is running', async () => {
    const response = await request(app).get('/');
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.text, '<h1>Hello World!</h1>');
});

Given('the Orders are empty', async () => {
    orders.length = 0;
});


//================================== Price tests ==================================================//

When('a user submits a Bid with Quantity: {int} and {int} percent change to the price', async (qty, percent) => {
    getData();
    await new Promise(resolve => setTimeout(resolve, 2000)); 
    const { lastPrice } = require('../../index.js');
    let price = percent >= 0 ? (1 + percent / 100) * lastPrice : lastPrice / (1 - percent / 100);
    price = Number(price.toFixed(2));
    if (isPriceWithinRange(price, lastPrice)) {
        const bid = {
            id: id,
            order: "Bid",
            price: price,
            quantity: qty
        };
        orders.push(bid);
        id++;
    } 
});

When('a user submits an Offer with Quantity: {int} and {int} percent change to the price', async (qty, percent) => {
    getData();
    await new Promise(resolve => setTimeout(resolve, 2000)); 
    const { lastPrice } = require('../../index.js');
    let price = percent >= 0 ? (1 + percent / 100) * lastPrice : lastPrice / (1 - percent / 100);
    price = Number(price.toFixed(2));
    if (isPriceWithinRange(price, lastPrice)) {
        const bid = {
            id: id,
            order: "Offer",
            price: price,
            quantity: qty
        };
        orders.push(bid);
        id++;
    }
});

//=================================================== Quantity tests =========================================//

When('a user orders a Bid with Quantity: {float}', async (qty) => {
    getData();
    await new Promise(resolve => setTimeout(resolve, 2000)); 
    const { lastPrice } = require('../../index.js');
    const response = await request(app)
        .post('/api/orders')
        .send({ order: 'Bid', price: lastPrice, quantity: qty });
});

When('a user orders an Offer with Quantity: {float}', async (qty) => {
    getData();
    await new Promise(resolve => setTimeout(resolve, 2000)); 
    const { lastPrice } = require('../../index.js');
    const response = await request(app)
        .post('/api/orders')
        .send({ order: 'Offer', price: lastPrice, quantity: qty });
});

//=================================================== Matching tests =========================================//

When('a user orders a Bid with Quantity: {int} and {int} percent change to the price', async (qty, percent) => {
    getData();
    await new Promise(resolve => setTimeout(resolve, 2000)); 
    const { lastPrice } = require('../../index.js');
    let price = percent >= 0 ? (1 + percent / 100) * lastPrice : lastPrice / (1 - percent / 100);
    price = Number(price.toFixed(2));
    const response = await request(app)
        .post('/api/orders')
        .send({ order: 'Bid', price: price, quantity: qty });
  })

  When('a user orders an Offer with Quantity: {int} and {int} percent change to the price', async (qty, percent) => {
    getData();
    await new Promise(resolve => setTimeout(resolve, 2000)); 
    const { lastPrice } = require('../../index.js');
    let price = percent >= 0 ? (1 + percent / 100) * lastPrice : lastPrice / (1 - percent / 100);
    price = Number(price.toFixed(2));
    const response = await request(app)
        .post('/api/orders')
        .send({ order: 'Offer', price: price, quantity: qty });
  })

Then('the length of Orders is: {int}', async (length) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    assert.strictEqual(orders.length, length);
})

Then('the length of Trades is: {int}', async (length) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    let trades = getTrades();
    console.log(trades);
    assert.strictEqual(trades.length, length);
})

Then('the Quantity of Trades index {int} is {int}', (index, qty) => {
    let trades = getTrades();
    assert.strictEqual(trades[index].quantity, qty);
  })

Then('the server is closed', () => {
    closeServer();
})





