const express = require('express')
const app = express()
const https = require('https');
const url = 'https://api.marketdata.app/v1/stocks/quotes/AAPL/'
//const dataService = require('./apis/marketDataApi')

app.use(express.json())

let lastPrice

// If the API controller doesn't work we can get the data from here also


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


// Used to check for the need of an hourly API call
let timeStamp = new Date()
getData()
//lastPrice = dataApi.getData()

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
    } else {
      console.log('order price is outside the price margin')
      return response.status(400).json({
        error: 'order price is outside of the price margin'
      })
    }

    response.json(order)

  })

const matchOrders = () => {
  console.log("Matching orders!")
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