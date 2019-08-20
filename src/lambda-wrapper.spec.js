const { use } = require('./lambda-wrapper');

test('should send json output properly', async () => {

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
  const callback = jest.fn();
  lambdaHandler(proxyRequest, {}, callback);

  expect(callback).toBeCalledWith(null, {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: '{"a":1}'
  });

});


test('should handle json body on a post request', async () => {

  const lambdaHandler = use((req, res) => {
    res.json(req.body);
  });

  const requestObject = JSON.stringify({a: 1});

  const proxyRequest = {
    body: requestObject,
    headers: {
      'Content-Type': 'application/json'
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
  const callback = jest.fn();
  lambdaHandler(proxyRequest, {}, callback);

  expect(callback).toBeCalledWith(null, {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: requestObject
  });

});
