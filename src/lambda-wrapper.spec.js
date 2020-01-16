const { ApiGatewayHandler } = require('./lambda-wrapper');
const Router = require('router');
const bodyParser = require('body-parser');

function finalHandlerPassTrough (err, out, req, res) {
  return out
}

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

    const router = Router()
    router.use((req, res) => {
      res.json({a: 1});
    })
    const lambdaHandler = ApiGatewayHandler(router, finalHandlerPassTrough);
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
    const result = await lambdaHandler(proxyRequest, {})

    expect(result).toEqual({
      statusCode: 200,
      headers: {
        'content-type': 'application/json'
      },
      body: '{"a":1}'
    });

  });


  it('should handle json body on a post request', async () => {

    const router = Router()
    router.use(bodyParser.json())
    router.use((req, res) => {
      res.json(req.body);
    })
    const lambdaHandler = ApiGatewayHandler(router, finalHandlerPassTrough);

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

    const result = await lambdaHandler(proxyRequest, {});
    expect(result).toEqual({
      statusCode: 200,
      headers: {
        'content-type': 'application/json'
      },
      body: requestObject
    });

  });

  it('should run multiple middlewares', async () => {
    expect.assertions (1)
    const router = Router()
    router.use((req, res, next) => {
      req.fromFirstEndpoint = '1';
      next();
    })
    router.use((req, res) => {
      res.json({b: req.fromFirstEndpoint});
    })
    const lambdaHandler = ApiGatewayHandler(router, finalHandlerPassTrough);

    const result = await lambdaHandler(proxyRequest, {});

    expect (result).toEqual({
      statusCode: 200,
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({"b":"1"})
    })
  });

  it('should handle errors', async () => {
    expect.assertions(1);

    const router = Router()
    router.use((req, res, next) => {
      throw Error('test');
    })

    const lambdaHandler2 = ApiGatewayHandler(router, err => {
      expect(err).toEqual(Error('test'));
    })
    await lambdaHandler2(proxyRequest, {})
  })
  
  it('should handle next(error)', async () => {
    expect.assertions(1);

    const router = Router()
    router.use((req, res, next) => {
      next('test');
    })
    const lambdaHandler = ApiGatewayHandler(router, err => {
      expect(err).toEqual('test');
    });
    await lambdaHandler(proxyRequest, {})

  })

  it('GET with path', async () => {
    expect.assertions(1)
    const router = Router()
    router.get('/*', (req, res, next) => {
      req.fromFirstEndpoint = 1;
      next();
    });
    router.get('/path', (req, res) => {
      res.json({a: req.fromFirstEndpoint, b: 2});
    });

    const lambdaHandler = ApiGatewayHandler(router, finalHandlerPassTrough);
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

    const result = await lambdaHandler(proxyRequest, {});
    expect(result).toEqual({
      statusCode: 200,
      headers: {
        'content-type': 'application/json'
      },
      body: '{"a":1,"b":2}'
    });

  });

  it('POST matching only post handler', async () => {
    expect.assertions(1)
    const router = Router()
    router.get('/path', (req, res, next) => {
      req.foo = 1;
      next();
    });

    router.post('/path', (req, res) => {
      res.json({a: req.foo, b: 2});
    });

    const lambdaHandler = ApiGatewayHandler(router, finalHandlerPassTrough);

    const result = await lambdaHandler(proxyRequest, {});
    expect(result).toEqual({
      statusCode: 200,
      headers: {
        'content-type': 'application/json'
      },
      body: '{"b":2}'
    });

  });

  it('Router cascade', async () => {
    expect.assertions(1)
    const subRouter = Router()
    
    subRouter.post('/path', (req, res) => {
      res.json({b: 2});
    });

    const router = Router()
    router.use('/testing', subRouter)

    const lambdaHandler = ApiGatewayHandler(router, finalHandlerPassTrough);

    let request = {}
    Object.assign(request, proxyRequest)
    request.path = '/testing/path'
    const result = await lambdaHandler(request, {});
    expect(result).toEqual({
      statusCode: 200,
      headers: {
        'content-type': 'application/json'
      },
      body: '{"b":2}'
    });

  });

});