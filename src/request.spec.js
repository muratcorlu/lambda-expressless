const { Request } = require('./request');

describe('Request object', () => {
  const requestObject = {a:1};
  const event = {
    body: JSON.stringify(requestObject),
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

  it('read body', () => {
    const request = new Request(event);

    expect(request.body).toEqual(requestObject);
  });

  it('check type', () => {
    const request = new Request(event);
    expect(request.is('json')).toBe(true);
  })
});
