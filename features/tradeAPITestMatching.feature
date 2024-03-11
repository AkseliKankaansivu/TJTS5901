Feature: Trading API End-to-End Test, matching
As a user
I want to match my bid to a matching offer

Scenario: User creates a bid that is matched to an offer
Given the trading application is running
And the Orders are empty

When a user orders a Bid with Quantity: 100
And a user orders an Offer with Quantity: 100 and -20 percent change to the price
And a user orders a Bid with Quantity: 200 and 1 percent change to the price
And a user orders a Bid with Quantity: 50 and -5 percent change to the price
And a user orders a Bid with Quantity: 30
And a user orders an Offer with Quantity: 250
Then the length of Trades is: 2
And the Quantity of Trades index 0 is 200
And the Quantity of Trades index 1 is 50
And the server is closed
