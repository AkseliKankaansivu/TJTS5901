const express = require('express')
const app = express()
const https = require('https');
const url = 'https://api.marketdata.app/v1/stocks/quotes/AAPL/'


app.use(express.json())

let lastPrice = 0

// Making the GET request to the API
const getData = () => {
  https.get(url, {
  headers: {
      'Accept': 'application/json'
  }
}, (response) => {
  let data = '';

  // A chunk of data has been received.
  response.on('data', (chunk) => {
      data += chunk;
  });

  // The whole response has been received. Print out the result.
  response.on('end', () => {
      if (response.statusCode === 200 || response.statusCode === 203) {
        console.log("Initializin price data!\n")
        console.log("Data receive from the stock API:")
        console.log(JSON.parse(data));

        lastPrice = JSON.parse(data).last[0];
        module.exports = { lastPrice };

        console.log("Current last price:")
        console.log(lastPrice)
        console.log()
      } else {
          console.log(`Failed to retrieve data: ${response.statusCode}`);
      }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
}


// Initializing a timestamp used to check for the need of an hourly API call
let timeStamp = new Date()
// Initializing the last stock price
getData()

// Bid = User wants to buy, Max price user is willing to pay, amount user is willing to buy
// Offer = user wants to sell, Min price user is willing to sell, amount user is willing to sell

/*let orders = [
    {
      id: 1,
      order: "Bid",
      price: 175.00,
      quantity: 1000
    },
    {
      id: 2,
      order: "Bid",
      price: 170.50,
      quantity: 2000
    },
    {
      id: 3,
      order: "Offer",
      price: 180.99,
      quantity: 1500
    }
  ]*/

// empty array for easier testing
let orders = []

// Store matches that have happened after submitting an order here
let trades = []


// REST End Points for Trade Data, Order Data and submitting Orders

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

// End point for Trade Data
app.get('/api/trades', (request, response) => {
  response.json(trades)
})

// End point for Order Data
app.get('/api/orders', (request, response) => {
  response.json(orders)
})

// End point for a single order by id
app.get('/api/orders/:id', (request, response) => {
  const id = Number(request.params.id)
  const order = orders.find(order => order.id === id)
  if (order) {
      response.json(order)
    } else {
      response.status(404).end()
    }
})

// End point for posting orders
app.post('/api/orders', (request, response) => {
  const body = request.body

  // Require order, price and quantity information
  if(!body.order || !body.price || !body.quantity) {
      return response.status(400).json({
          error: 'missing critical information'
      })
  }

  const order = {
      order: body.order,
      price: body.price,
      quantity: body.quantity,
      id: generateId(),
  }    

  // App logic here!

  console.log("New Order received! \n")

  // First we validate the order price

  // New Date to check if enough time has passed after the last api call
  const now = new Date()

  // Check if we need to update the last trade price
  if (timeStamp.getDate() != now.getDate() || timeStamp.getHours() != now.getHours()) {
    console.log('An hour hast passed since the last price update, updating...')
    // Updates the last stock price
    getData()
    // Update the timestamp
    timeStamp = now
  } else {
    console.log('An hour has not passed since the last price update, using old price...')
  }

  console.log("last price: " + lastPrice)
  console.log("order price: " + order.price)

  // Check if the price of the order is inside our margin
  if (order.price < lastPrice * 1.1 && order.price > lastPrice * 0.9) {
    
    // Since the price is inside the margin, we need to send a response (200 OK)
    response.json(order)

    // Start processing order data for possible matches
    console.log('order price is inside the price margin, processing... \n')
    orders = orders.concat(order)
    // New order is stored, next we need to check for matching orders    
    matchOrders()
    console.log()
    // Some logs to help visualizing data
    console.log("Data after prosessing:\n")
    console.log("Orders:")
    console.log(orders)
    console.log()
    console.log("Trades:")
    console.log(trades)
    console.log()
    console.log("-------------------------------------------------------------------------")
    console.log()
  } else {
    // The order price was not inside the margin, send response (400 Bad Request)
    console.log('order price is outside the price margin, order was not processed')
    console.log()
    console.log("-------------------------------------------------------------------------")
    console.log()
    return response.status(400).json({
      error: 'order price is outside of the price margin'
    })
  }
})

// When an order has been submitted, check for a match and create a new trade if found
const matchOrders = () => {
  console.log("Matching orders!\n")
  console.log(orders)
  // No need to match with less than 2 orders
  if (orders.length < 2) {
    console.log("Not enough orders to match, stopping matching")
    return
  }

  // Try to match using the latest order
  const latestOrder = orders[orders.length-1]

  // Make sure the latest offer has quantity left
  // If not, we stop matching
  if (latestOrder.quantity <= 0) {
    console.log("Quantity 0, removing and starting matching from the beginning")
    orders.pop()
    
    // We need to start from the beginning
    // If there was a match with equal quantity, there should be another order with a quantity of 0
    matchOrders()

    // We need to stop this recursion here because we need to start a new recursion from the beginning without continuing this recursion
    return
  }

  // Something to store possible matches
  let possibleMatches = []


  // Get all bids/offers depending on which way we are operating and find matches

  // Logic for matching a Bid
  if (latestOrder.order === "Bid") {
    possibleMatches = getAllOffers()

    // Logs for debugging

    //console.log(orders)
    //console.log(possibleMatches)

    const offersWithGoodPrice = possibleMatches.filter((order) => order.price <= latestOrder.price)

    if (offersWithGoodPrice.length < 1) {
      console.log("No offers with a low enough price were found, stopping matching")
      return
    }

    // Start matching by finding the offer with the lowest price (going from oldest to newest)
    let lowestPriceOffer = offersWithGoodPrice[0]

    if(offersWithGoodPrice.length > 1) {
      // Try to match beginning from the 
      for(let i = 1; i < offersWithGoodPrice.length; i++) {
        if (offersWithGoodPrice[i].price < lowestPriceOffer.price) {
          lowestPriceOffer = offersWithGoodPrice[i]
        }
      }
    }

    // Now we should have found the oldest offer with the lowest price from all of the offers with a lower or equal price of the bid
    // Figure out the new quantities and the trade quantity
    let tradeQuantity = 0
    if (latestOrder.quantity > lowestPriceOffer.quantity) {
      tradeQuantity = lowestPriceOffer.quantity
      // Calculate the new quantity and remove filled offer
      orders = orders.filter((order) => order.id != lowestPriceOffer.id)
      orders[orders.indexOf(latestOrder)].quantity -= lowestPriceOffer.quantity
    } else {
      tradeQuantity = latestOrder.quantity
      // Calculate the new quantities, order with a 0 quantity will stop the recursion on the next round
      orders[orders.indexOf(lowestPriceOffer)].quantity = lowestPriceOffer.quantity - latestOrder.quantity
      orders[orders.indexOf(latestOrder)].quantity = 0      
    }

    // Creating and adding the new trade
    const trade = {
      time: new Date(),
      price: lowestPriceOffer.price,
      quantity: tradeQuantity
    }

    trades = trades.concat(trade)

    console.log("New Trade!\n")
    console.log(trade)
    console.log()

    // Now we need to try to match again recursively until the quantity of the latest bid goes to 0 or there are no more matches
    matchOrders()

    // Logic for matching an Offer
  } else {
    possibleMatches = getAllBids()

    // Logs for debugging
    // console.log(orders)
    // console.log(possibleMatches)

    const bidsWithGoodPrice = possibleMatches.filter((order) => order.price >= latestOrder.price)

    // If there are no bids with a fitting price, stop matching
    if (bidsWithGoodPrice.length < 1) {
      console.log("No Bids with a high enough price were found, stopping matching")
      return
    }

    // Start matching by finding the bid with the highest price (going from oldest to newest)
    let highestPriceBid = bidsWithGoodPrice[0]

    if(bidsWithGoodPrice.length > 1) {      
      for(let i = 1; i < bidsWithGoodPrice.length; i++) {
        if (bidsWithGoodPrice[i].price > highestPriceBid.price) {
          highestPriceBid = bidsWithGoodPrice[i]
        }
      }
    }

    // Now we should have found the oldest bid with the highest price from all of the bids with a higher or equal price of the offer
    // Figure out the new quantities and the trade quantity
    let tradeQuantity = 0
    if (latestOrder.quantity > highestPriceBid.quantity) {
      tradeQuantity = highestPriceBid.quantity
      // Calculate the new quantity and remove filled bid
      orders = orders.filter((order) => order.id != highestPriceBid.id)
      orders[orders.indexOf(latestOrder)].quantity -= highestPriceBid.quantity
    } else {
      tradeQuantity = latestOrder.quantity
      // Calculate the new quantities, order with a 0 quantity will stop the recursion on the next round
      orders[orders.indexOf(highestPriceBid)].quantity = highestPriceBid.quantity - latestOrder.quantity
      orders[orders.indexOf(latestOrder)].quantity = 0
    }

    // Creating and adding the new trade
    const trade = {
      time: new Date(),
      price: highestPriceBid.price,
      quantity: tradeQuantity
    }

    trades = trades.concat(trade)

    console.log("New Trade!\n")
    console.log(trade)

    // Now we need to try to match again recursively until the quantity of the latest bid goes to 0 or there are no more matches
    matchOrders()

  }
}

// Function to get all Bids from all of the orders
getAllBids = () => {
  return orders.filter((order) => order.order === "Bid")
}

// Function to get all Offers from all of the orders
getAllOffers = () => {
  return orders.filter((order) => order.order === "Offer")
}

const generateId = () => {
    const maxId = orders.length > 0
        ? Math.max(...orders.map(n => n.id))
        : 0
    return maxId + 1
}

const PORT = process.env.PORT || 8080
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}\n`);
});

const getTrades = () => {
  return trades;
};

// Function to close the server connection
const closeServer = () => {
  server.close();
  console.log('Server connection closed.');
};

module.exports = { app, closeServer, getData, matchOrders, orders, getTrades };