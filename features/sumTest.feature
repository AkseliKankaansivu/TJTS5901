Feature: Sum functionality
As a user
I want to be able to calculate the sum of two numbers

Scenario: Sum of Two Positive Numbers
    Given I have two positive numbers: 1 and 1
    When I calculate the sum
    Then the result should be 2