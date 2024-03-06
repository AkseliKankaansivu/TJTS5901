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
          console.log(JSON.parse(data));
          lastPrice = JSON.parse(data).last[0];
          console.log(lastPrice)
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
let orders = [
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
  ]

// Store matches that have happened after submitting an order here
let trades = []


app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/orders', (request, response) => {
  response.json(orders)
})

app.get('/api/orders/:id', (request, response) => {
  const id = Number(request.params.id)
  const order = orders.find(order => order.id === id)
  if (order) {
      response.json(order)
    } else {
      response.status(404).end()
    }
})

app.post('/api/orders', (request, response) => {
  const body = request.body

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
  // First we need to validate the order against the latest market data
  // then maybe something like checkForSale() or matchOrders()

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
    console.log('order price is inside the price margin, processing...')
    orders = orders.concat(order)
    // New order is stored, next we need to check for matching orders    
    matchOrders()
    // Some logs to help visualizing data
    console.log("Data after prosessing:\n")
    console.log(orders)
    console.log()
    console.log(trades)
    console.log()
  } else {
    console.log('order price is outside the price margin')
    return response.status(400).json({
      error: 'order price is outside of the price margin'
    })
  }

  response.json(order)

})

// When an order has been submitted, check for a match and create a new trade if found
const matchOrders = () => {
  console.log("Matching orders!")
  // No need to match with less than 2 orders
  if (orders.length < 1) return

  // Try to match using the latest order
  const latestOrder = orders[orders.length-1]

  // Make sure the latest offer has quantity left
  // If not, we stop matching
  if (latestOrder.quantity <= 0) {
    console.log("Quantity 0, removing and stopping matching")
    orders.pop()
    return
  }

  // Something to store possible matches
  let possibleMatches = []


  // Get all bids/offers depending on which way we are operating and find matches
  if (latestOrder.order === "Bid") {
    possibleMatches = getAllOffers()
    console.log(orders)
    console.log(possibleMatches)
    const offersWithGoodPrice = possibleMatches.filter((order) => order.price <= latestOrder.price)

    if (offersWithGoodPrice.length < 1) {
      console.log("No offers with a low enough price were found, stopping matching")
      return
    }

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
      tradeQuantity = latestOrder.quantity - lowestPriceOffer.quantity
      // Calculate the new quantity and remove filled offer
      orders = orders.filter((order) => order.id != lowestPriceOffer.id)
      orders[orders.indexOf(latestOrder)].quantity -= lowestPriceOffer.quantity
    } else {
      tradeQuantity = latestOrder.quantity
      // Calculate the new quantities, order with a 0 quantity will stop the recursion on the next round
      orders[orders.indexOf(latestOrder)].quantity = 0
      orders[orders.indexOf(lowestPriceOffer)].quantity = lowestPriceOffer.quantity - latestOrder.quantity
    }


    const trade = {
      time: new Date(),
      price: lowestPriceOffer.price,
      quantity: tradeQuantity
    }

    trades = trades.concat(trade)
    console.log("New Trade!")
    console.log(trade)

    // Now we need to try to match again recursively until the quantity of the latest bid goes to 0 or there are no more matches
    matchOrders()

    // TODO!!!
  } else {
    possibleMatches = getAllBids()

    for(let i = 0; i < possibleMatches.length; i++) {
      
    }

  }

  // Try to match beginning from the 
  for(let i = 0; i < orders.length-1; i++) {

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
app.listen(PORT)
console.log(`Server running on port ${PORT}`)