Feature: Trading API End-to-End Test, quantity validation
As a user
I want to check that the quantity of an order
is verified to be valid

Scenario: Bid and Offer quantities are validated correctly
Given the trading application is running
And the Orders are empty

When a user orders a Bid with Quantity: 0
Then the length of Orders is: 0

When a user orders a Bid with Quantity: 10.1
Then the length of Orders is: 0

When a user orders a Bid with Quantity: -100
Then the length of Orders is: 0
And the server is closed