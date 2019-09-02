const { Response } = require('./response');
const { Request } = require('./request');

describe('Response object', () => {
  it('set response status properly', () => {
    const cb = jest.fn();

    const response = new Response(null, cb);

    response.status(404);
    response.end();

    expect(cb).toHaveBeenCalledWith(null, {
      statusCode: 404,
      headers: {},
      body: ''
    });
  });

  it('send body properly', () => {
    const cb = (err, response) => {
      expect(response.body).toBe('hello');
    };

    const response = new Response(null, cb);

    response.send('hello');
  });

  it('set content-type', () => {
    const cb = (err, response) => {
      expect(response.headers).toBe({
        'content-type': 'text/html'
      });
    };
    const response = new Response(null, cb);

    response.type('text/html');

  });


  it('get header', () => {
    const cb = (err, response) => {};

    const response = new Response(null, cb);

    response.set('X-Header', 'a');

    expect(response.get('X-Header')).toBe('a');
    // Should work case insensitive
    expect(response.get('x-Header')).toBe('a');
  });

  it('can chain status method', () => {
    const cb = (err, response) => {
      expect(response.statusCode).toBe(201);
    };

    const response = new Response(null, cb);

    response.status(201).end();
  });

  it('can chain set method', () => {
    const cb = (err, response) => {
      expect(response.headers).toEqual({
        'x-header': 'a'
      });
    };

    const response = new Response(null, cb);

    response.set('x-header', 'a').end();
  });

  it('can chain type method', () => {
    const cb = (err, response) => {
      expect(response.headers).toEqual({
        'content-type': 'text/xml'
      });
    };

    const response = new Response(null, cb);

    response.type('text/xml').end();
  });

  describe('should send correct response via accept header', () => {
    it('with regular header', () => {

      const event = {
        headers: {
          'Accept': 'text/xml',
          'Content-Length': 0
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

      const req = new Request(event);
      req.next = (error) => {

      };

      const cb = (err, response) => {
        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toBe('text/xml');
        expect(response.body).toBe('<xml/>');
      };

      const response = new Response(req, cb);

      response.format({
        'application/json': (req, res, next) => {
          res.json({a: 1});
        },
        'text/xml': (req, res, next) => {
          res.send('<xml/>');
        }
      });
    });

    it('without regular header', () => {

      const event = {
        headers: {
          'Accept': 'text/html',
          'Content-Length': 0
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

      const req = new Request(event);
      req.next = (error) => {

      };

      const cb = (err, response) => {
        expect(response.statusCode).toBe(200);
        expect(response.headers['content-type']).toBe('text/html');
        expect(response.body).toBe('<p>hi</p>');
      };

      const response = new Response(req, cb);

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
    });


    it('with non acceptable accept header', () => {

      const event = {
        headers: {
          'Accept': 'image/jpeg',
          'Content-Length': 0
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

      const req = new Request(event);
      req.next = (error) => {
        expect(error.status).toBe(406);
        expect(error).toEqual(Error('Not Acceptable'));
      };

      const cb = (err, response) => {
      };

      const response = new Response(req, cb);

      response.format({
        'application/json': (req, res, next) => {
          res.json({a: 1});
        }
      });
    });
  })
});

