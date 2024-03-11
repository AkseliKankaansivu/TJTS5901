Feature: Trading API End-to-End Test, price validation
As a user
I want to validate the price of an offer and bid
to be in a certain range to the last price of the stock

Scenario: Bid and Offer prices are validated correctly
Given the trading application is running
And the Orders are empty

When a user submits a Bid with Quantity: 1000 and 8 percent change to the price
Then the length of Orders is: 1

When a user submits an Offer with Quantity: 1000 and -10 percent change to the price
Then the length of Orders is: 2

When a user submits a Bid with Quantity: 1000 and 11 percent change to the price
Then the length of Orders is: 2

When a user submits an Offer with Quantity: 100 and -101 percent change to the price
Then the length of Orders is: 2
And the server is closed





