const { Given, When, Then } = require('cucumber');
const assert = require('assert');

let number1, number2, result;

Given('I have two positive numbers: {int} and {int}', function (num1, num2) {
    number1 = num1;
    number2 = num2;
});

When('I calculate the sum', function () {
    result = number1 + number2;
});

Then('the result should be {int}', function (expectedResult) {
    assert.strictEqual(result, expectedResult);
});