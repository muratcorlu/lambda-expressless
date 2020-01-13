const { Response } = require('./response');
const { Request } = require('./request');

describe('Response object', () => {
  it('set response status properly', () => {
    const response = new Response(null);
    response.status(404);
    response.end();
    expect(response.getApiGatewayResult()).toEqual({
      statusCode: 404,
      headers: {},
      body: ''
    });
  });

  it('send body properly', () => {
    const response = new Response(null);
    response.send('hello');
    expect(response.getApiGatewayResult().body).toBe('hello');
  });

  it('set content-type', () => {
    const response = new Response(null);
    response.type('text/html');
    expect(response.getApiGatewayResult().headers).toEqual({
      'content-type': 'text/html'
    });
  });


  it('get header', () => {
    const response = new Response(null);
    response.set('X-Header', 'a');
    expect(response.get('X-Header')).toBe('a');
    // Should work case insensitive
    expect(response.get('x-Header')).toBe('a');
  });

  it('can chain status method', () => {
    const response = new Response(null);
    response.status(201).end();
    expect(response.statusCode).toBe(201);
    expect(response.getApiGatewayResult().statusCode).toBe(201);
  });

  it('can chain set method', () => {
    const response = new Response(null);
    response.set('x-header', 'a').end();
    expect(response.getApiGatewayResult().headers).toEqual({
      'x-header': 'a'
    });
  });

  it('can chain type method', () => {
    const response = new Response(null);
    response.type('text/xml').end();
    expect(response.getApiGatewayResult().headers).toEqual({
      'content-type': 'text/xml'
    });
  });

  describe('should send correct response via accept header', () => {
    it('with regular header', () => {

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
      req.next = (error) => {

      };

      const response = new Response(req);
      response.format({
        'application/json': (req, res, next) => {
          res.json({a: 1});
        },
        'text/xml': (req, res, next) => {
          res.send('<xml/>');
        }
      });

      const apiGatewayRes = response.getApiGatewayResult()
      expect(apiGatewayRes.statusCode).toBe(200);
      expect(apiGatewayRes.headers['content-type']).toBe('text/xml');
      expect(apiGatewayRes.body).toBe('<xml/>');
    });

    it('without regular header', () => {

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
      req.next = (error) => {

      };
      
      const response = new Response(req);
      response.format({
        'application/json': (req, res, next) => {
          res.json({a: 1});
        },
        'text/xml': (req, res, next) => {
          res.send('<xml/>');
        },
        'default': (req, res, next) => {
          res.type('text/html').send('<p>hi</p>');
        }
      });

      const apiGatewayRes = response.getApiGatewayResult()
      expect(apiGatewayRes.statusCode).toBe(200);
      expect(apiGatewayRes.headers['content-type']).toBe('text/html');
      expect(apiGatewayRes.body).toBe('<p>hi</p>');
    });


    it('with non acceptable accept header', () => {

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
      req.next = (error) => {
        expect(error.status).toBe(406);
        expect(error).toEqual(Error('Not Acceptable'));
      };

      const response = new Response(req);

      response.format({
        'application/json': (req, res, next) => {
          res.json({a: 1});
        }
      });
    });
  })
});

