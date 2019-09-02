const { use } = require('./lambda-wrapper');
const bodyParser = require('body-parser');

describe('Lambda Wrapper', () => {
  const proxyRequest = {
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/path',
    pathParameters: { },
    queryStringParameters: { },
    multiValueQueryStringParameters: { },
    stageVariables: { },
    requestContext: {},
    resource: ''
  };

  it('should send json output properly', async () => {

    const lambdaHandler = use((req, res) => {
      res.json({a: 1});
    });

    const proxyRequest = {
      body: '',
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'GET',
      isBase64Encoded: false,
      path: '/path',
      pathParameters: { },
      queryStringParameters: { },
      multiValueQueryStringParameters: { },
      stageVariables: { },
      requestContext: {},
      resource: ''
    };
    const callback = (err, payload) => {
      expect(err).toBe(null);
      expect(payload).toEqual({
        statusCode: 200,
        headers: {
          'content-type': 'application/json'
        },
        body: '{"a":1}'
      });
    };

    await lambdaHandler(proxyRequest, {}, callback);

  });


  it('should handle json body on a post request', () => {

    const lambdaHandler = use(bodyParser.json(), (req, res) => {
      res.json(req.body);
    });

    const requestObject = JSON.stringify({a: 1});

    const proxyRequest = {
      body: requestObject,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': requestObject.length
      },
      multiValueHeaders: {},
      httpMethod: 'POST',
      isBase64Encoded: false,
      path: '/path',
      pathParameters: { },
      queryStringParameters: { },
      multiValueQueryStringParameters: { },
      stageVariables: { },
      requestContext: {},
      resource: ''
    };
    const callback = (err, payload) => {
      expect(err).toBe(null);
      expect(payload).toEqual({
        statusCode: 200,
        headers: {
          'content-type': 'application/json'
        },
        body: requestObject
      });
    }

    lambdaHandler(proxyRequest, {}, callback);

  });

  it('should run multiple middlewares', () => {
    const lambdaHandler = use((req, res, next) => {
      req.params.fromFirstEndpoint = '1';
      next();
    }, (req, res) => {
      res.json({b: req.params.fromFirstEndpoint});
    });

    const callback = (err, payload) => {
      expect(err).toBe(null);
      expect(payload).toEqual({
        statusCode: 200,
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({"b":"1"})
      });
    }

    lambdaHandler(proxyRequest, {}, callback);
  });

  it('should run multiple middlewares as arrays', () => {
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

    const callback = (err, payload) => {
      expect(err).toBe(null);
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
    }

    lambdaHandler(proxyRequest, {}, callback);
  });

  it('should handle errors', () => {
    const lambdaHandler = use((req, res, next) => {
      throw Error('test');
    });

    const callback = (err, payload) => {
      expect(err).toStrictEqual(Error('test'));
    }

    lambdaHandler(proxyRequest, {}, callback);
  })
});
