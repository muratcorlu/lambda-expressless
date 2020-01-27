const { Response } = require('./response');
const { Request } = require('./request');

describe('Response object', () => {
  it('set response status properly', async () => {
    const cb = jest.fn();

    const response = new Response();

    response.status(404);
    response.end();

    const resp = await response.promise;

    expect(resp).toEqual({
      statusCode: 404,
      headers: {},
      body: ''
    });
  });

  it('send body properly', async () => {
    const response = new Response();

    response.send('hello');

    const resp = await response.promise;
    expect(resp.body).toBe('hello');
  });

  it('set content-type', async () => {
    const response = new Response();

    response.type('text/html').end();

    const resp = await response.promise;

    expect(resp.headers).toEqual({
      'content-type': 'text/html'
    });
  });


  it('get header', () => {
    const response = new Response();

    response.set('X-Header', 'a');

    expect(response.get('X-Header')).toBe('a');
    // Should work case insensitive
    expect(response.get('x-Header')).toBe('a');
  });

  it('can chain status method', async () => {
    const response = new Response();

    response.status(201).end();

    const resp = await response.promise;
    expect(resp.statusCode).toBe(201);

  });

  it('can chain set method', async () => {
    const response = new Response();

    response.set('x-header', 'a').end();

    const resp = await response.promise;

    expect(resp.headers).toEqual({
      'x-header': 'a'
    });

  });

  it('can chain type method', async () => {
    const response = new Response();

    response.type('text/xml').end();
    const resp = await response.promise;

    expect(resp.headers).toEqual({
      'content-type': 'text/xml'
    });
  });

  describe('should send correct response via accept header', () => {
    it('with regular header', async () => {

      const event = {
        headers: {
          'Accept': 'text/xml',
          'Content-Length': 0
        },
        multiValueHeaders: {
          'Accept': [ 'text/xml' ],
          'Content-Length': [ 0 ]
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

      const req = new Request(event);
      const response = new Response(req);

      response.format({
        'application/json': () => {
          response.json({a: 1});
        },
        'text/xml': () => {
          response.send('<xml/>');
        }
      });

      const resp = await response.promise;

      expect(resp.statusCode).toBe(200);
      expect(resp.headers['content-type']).toBe('text/xml');
      expect(resp.body).toBe('<xml/>');

    });

    it('without regular header', async () => {

      const event = {
        headers: {
          'Accept': 'text/html',
          'Content-Length': 0
        },
        multiValueHeaders: {
          'Accept': [ 'text/html' ],
          'Content-Length': [ 0 ]
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

      const req = new Request(event);
      const response = new Response(req);

      response.format({
        'application/json': () => {
          response.json({a: 1});
        },
        'text/xml': () => {
          response.send('<xml/>');
        },
        'default': () => {
          response.type('text/html').send('<p>hi</p>');
        }
      });
      const resp = await response.promise;

      expect(resp.statusCode).toBe(200);
      expect(resp.headers['content-type']).toBe('text/html');
      expect(resp.body).toBe('<p>hi</p>');
    });


    it('with non acceptable accept header', async () => {

      const event = {
        headers: {
          'Accept': 'image/jpeg',
          'Content-Length': 0
        },
        multiValueHeaders: {
          'Accept': [ 'image/jpeg' ],
          'Content-Length': [ 0 ]
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

      const req = new Request(event);
      const response = new Response(req);

      response.format({
        'application/json': () => {
          response.json({a: 1});
        }
      });

      const resp = await response.promise;

      expect(resp.statusCode).toBe(406);
      expect(resp.body).toEqual('Not Acceptable');

    });
  })
});

