//Note this test is not working properly, but I cant really be bothered to fight with it anymore

const { getData, closeServer } = require('../index.js'); // Replace with your file path
jest.fn(); // Mock the https.get function

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
    mockGet.mockImplementation((url, options, callback) => {
      const mockResponse = new https.IncomingMessage();
      mockResponse.statusCode = 200;
      callback(mockResponse);
      mockResponse.emit('data', JSON.stringify(responseData));
      mockResponse.emit('end');
      expect(options.headers).toEqual({ 'Accept': 'application/json' });
    });
  
    await getData(); // Call getData
    await new Promise(resolve => setTimeout(resolve, 1000));
    const { lastPrice } = require('../index.js');
    console.log("After getData");
    console.log("lastPrice:", lastPrice);
    expect(lastPrice).toEqual(responseData.last[0]); // Check if lastPrice is updated correctly
  });
});

afterAll(async () => {
    await closeServer();
});
