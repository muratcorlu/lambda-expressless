const { ApiGatewayHandler } = require('./lambda-wrapper');
const Router = require('router');
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

  it('should send json output properly', async (done) => {

    const router = Router()
    router.use((req, res) => {
      res.json({a: 1});
    })
    const lambdaHandler = ApiGatewayHandler(router);

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
      done()
    };

    lambdaHandler(proxyRequest, {}, callback);

  });


  it('should handle json body on a post request', (done) => {

    const router = Router()
    router.use(bodyParser.json())
    router.use((req, res) => {
      res.json(req.body);
    })
    const lambdaHandler = ApiGatewayHandler(router);

    const requestObject = JSON.stringify({a: 1});

    const proxyRequest = {
      body: requestObject,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': requestObject.length
      },
      multiValueHeaders: {
        'Content-Type': [ 'application/json' ],
        'Content-Length': [ requestObject.length ]
      },
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
      done();
    }

    lambdaHandler(proxyRequest, {}, callback);

  });

  it('should run multiple middlewares', (done) => {
    const router = Router()
    router.use((req, res, next) => {
      req.params.fromFirstEndpoint = '1';
      next();
    })
    router.use((req, res) => {
      res.json({b: req.params.fromFirstEndpoint});
    })
    const lambdaHandler = ApiGatewayHandler(router);

    const callback = (err, payload) => {
      expect(err).toBe(null);
      expect(payload).toEqual({
        statusCode: 200,
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({"b":"1"})
      });
      done();
    }

    lambdaHandler(proxyRequest, {}, callback);
  });

  it('should handle errors', (done) => {
    const router = Router()
    router.use((req, res, next) => {
      throw Error('test');
    })
    const lambdaHandler = ApiGatewayHandler(router);

    const callback = (err, payload) => {
      expect(err).toStrictEqual(Error('test'));
      done();
    }

    lambdaHandler(proxyRequest, {}, callback);
  })
  
  it('returns undefined if callback is set', () => {
    const router = Router()
    router.use(bodyParser.json())
    router.use((req, res) => {
      res.send('foo bar')
    })
    const callback = (err, payload) => {
      expect(payload.body).toEqual('foo bar');
    }
    const lambdaHandler = ApiGatewayHandler(router);
    const result = lambdaHandler(proxyRequest, {}, callback)
    expect(result).toBe(undefined)
  })

  it('returns promise if callback is undefined', () => {
    const router = Router()
    router.use(bodyParser.json())
    router.use((req, res) => {
      res.send('foo bar')
    })
    const lambdaHandler = ApiGatewayHandler(router);
    const promise = lambdaHandler(proxyRequest, {})
    // check if handler returns a valid promise
    // https://stackoverflow.com/a/38339199
    expect(Promise.resolve(promise) === promise).toBe(true)
    promise.then(payload => {
      expect(payload.body).toEqual('foo bar');
    })
  })

  it('GET with path', async (done) => {
    const router = Router()

    router.get('/', (req, res, next) => {
      req.params.a = 1;
      next();
    });

    router.get('/path', (req, res) => {
      res.json({a: req.params.a, b: 2});
    });

    const lambdaHandler = ApiGatewayHandler(router);

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
        body: '{"a":1,"b":2}'
      });
      done();
    };

    await lambdaHandler(proxyRequest, {}, callback);

  });

  it('POST matching only post handler', async (done) => {
    const router = Router()

    router.get('/', (req, res, next) => {
      req.params.a = 1;
      next();
    });

    router.post('/path', (req, res) => {
      res.json({a: req.params.a, b: 2});
    });

    const lambdaHandler = ApiGatewayHandler(router);

    const callback = (err, payload) => {
      expect(err).toBe(null);
      expect(payload).toEqual({
        statusCode: 200,
        headers: {
          'content-type': 'application/json'
        },
        body: '{"b":2}'
      });
      done();
    };

    await lambdaHandler(proxyRequest, {}, callback);

  });

  // it('ERROR handling', async (done) => {
  //   const router = Router()

  //   router.post('/', (req, res, next) => {
  //     next('Test error');
  //   });

  //   const lambdaHandler = ApiGatewayHandler(router);

  //   const callback = (err, payload) => {
  //     expect(err).toBe(null);
  //     expect(payload).toEqual({
  //       statusCode: 500,
  //       headers: {
  //         'content-type': 'application/json'
  //       },
  //       body: '{"error":"Test error"}'
  //     });
  //     done();
  //   };

  //   await lambdaHandler(proxyRequest, {}, callback);

  // });
});