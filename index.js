const express = require('express')
const app = express()

app.use(express.json())

let orders = [
    {
      id: 1,
      order: "Bid",
      price: 220.00,
      quantity: 1000
    },
    {
      id: 2,
      order: "Bid",
      price: 230.50,
      quantity: 2000
    },
    {
      id: 3,
      order: "Offer",
      price: 240.99,
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

    orders = orders.concat(order)

    // App logic here!
    // First we need to validate the order against the latest market data
    // Maybe something like checkForSale() or matchOrders()

    response.json(order)
  })

const generateId = () => {
    const maxId = orders.length > 0
        ? Math.max(...orders.map(n => n.id))
        : 0
    return maxId + 1
}

const PORT = process.env.PORT || 8080
app.listen(PORT)
console.log(`Server running on port ${PORT}`)