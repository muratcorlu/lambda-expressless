const { use } = require('./lambda-wrapper');
const bodyParser = require('body-parser');

describe('Lambda Wrapper', () => {
  let proxyRequest;
  beforeEach(() => {
    proxyRequest = {
      body: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'POST',
      isBase64Encoded: false,
      path: '/path',
      pathParameters: {},
      queryStringParameters: {},
      multiValueQueryStringParameters: {},
      stageVariables: {},
      requestContext: {},
      resource: ''
    };
  });

  it('should send json output properly', async () => {

    const lambdaHandler = use((req, res) => {
      res.json({ a: 1 });
    });

    proxyRequest = {
      body: '',
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'GET',
      isBase64Encoded: false,
      path: '/path',
      pathParameters: {},
      queryStringParameters: {},
      multiValueQueryStringParameters: {},
      stageVariables: {},
      requestContext: {},
      resource: ''
    };

    const payload = await lambdaHandler(proxyRequest, {});
    expect(payload).toEqual({
      statusCode: 200,
      headers: {
        'content-type': 'application/json'
      },
      body: '{"a":1}'
    });

  });


  it('should handle json body on a post request', async () => {

    const lambdaHandler = use(bodyParser.json(), (req, res) => {
      res.json(req.body);
    });

    const requestObject = JSON.stringify({ a: 1 });

    proxyRequest = {
      body: requestObject,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': requestObject.length
      },
      multiValueHeaders: {
        'Content-Type': ['application/json'],
        'Content-Length': [requestObject.length]
      },
      httpMethod: 'POST',
      isBase64Encoded: false,
      path: '/path',
      pathParameters: {},
      queryStringParameters: {},
      multiValueQueryStringParameters: {},
      stageVariables: {},
      requestContext: {},
      resource: ''
    };

    const payload = await lambdaHandler(proxyRequest, {});

    expect(payload).toEqual({
      statusCode: 200,
      headers: {
        'content-type': 'application/json'
      },
      body: requestObject
    });
  });

  it('should run multiple middlewares', async () => {
    const lambdaHandler = use((req, res, next) => {
      req.params.fromFirstEndpoint = '1';
      next();
    }, (req, res) => {
      res.json({ b: req.params.fromFirstEndpoint });
    });

    const payload = await lambdaHandler(proxyRequest, {});

    expect(payload).toEqual({
      statusCode: 200,
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ "b": "1" })
    });
  });

  it('should run multiple middlewares as arrays', async () => {
    const lambdaHandler = use([(req, res, next) => {
      req.params.fromFirstEndpoint = '1';
      next();
    }, (req, res, next) => {
      req.params.fromSecondEndpoint = '1';
      next();
    }], (req, res) => {
      res.json({
        fromFirstEndpoint: req.params.fromFirstEndpoint,
        fromSecondEndpoint: req.params.fromSecondEndpoint,
      })
    });

    const payload = await lambdaHandler(proxyRequest, {});

    expect(payload).toEqual({
      statusCode: 200,
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        fromFirstEndpoint: '1',
        fromSecondEndpoint: '1',
      })
    });
  });

  it('should handle errors', async () => {
    expect.assertions(1);

    const lambdaHandler = use((req, res, next) => {
      throw new Error('test');
    });

    await expect(lambdaHandler(proxyRequest, {})).rejects.toThrow(Error);

  });
});
