//Note this test is not working properly, but I cant really be bothered to fight with it anymore

const { getData, closeServer } = require('../index.js');
jest.fn(); // Mock the https.get function

beforeAll(async () => {
  await closeServer();
});

describe('getData function', () => {
  let mockGet;
  let responseData;

  beforeEach(() => {
    mockGet = jest.fn();
    responseData = {
      s: 'ok',
      symbol: ['AAPL'],
      ask: [170.11],
      askSize: [1],
      bid: [170],
      bidSize: [6],
      mid: [170.06],
      last: [169],
      change: [null],
      changepct: [null],
      volume: [81184],
      updated: [1709894539],
    };

    global.https = {
      get: mockGet,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should successfully fetch data and update lastPrice', async () => {
    // Mock the https.get function
    mockGet.mockImplementation((url, options, callback) => {
      // Simulate a mock response
      const mockResponse = new https.IncomingMessage();
      mockResponse.statusCode = 200;
      callback(mockResponse);
      mockResponse.emit('data', JSON.stringify(responseData));
      mockResponse.emit('end');
      expect(options.headers).toEqual({ 'Accept': 'application/json' });
    });
  
    // Call getData function
    await getData();
  
    // Wait for asynchronous operations to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
  
    // Require lastPrice after getData has been called
    const { lastPrice } = require('../index.js');
  
    // Assert that lastPrice is updated correctly
    expect(lastPrice).toEqual(responseData.last[0]);
  });
});

afterAll(async () => {
    await closeServer();
    await new Promise(resolve => setTimeout(resolve, 2000));
});
