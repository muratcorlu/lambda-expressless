const { Response } = require('./response');
const { Request } = require('./request');

describe('Response object', () => {
  it('set response status properly', done => {
    const res = new Response(null, out => {
      expect(out).toEqual({
        statusCode: 404,
        headers: {},
        body: ''
      });
      done()
    });
    res.status(404);
    res.end();
  });

  it('send body properly', done => {
    const res = new Response(null, out => {
      expect(out.body).toBe('hello');
      done()
    });
    res.send('hello');
  });

  it('set content-type', done => {
    const res = new Response(null, out => {
      expect(out.headers).toEqual({
        'content-type': 'text/html'
      });
      done()
    });
    res.type('text/html');
    res.send()
  });


  it('get header', done => {
    const res = new Response(null, out => {
      done()
    });
    res.set('X-Header', 'a');
    expect(res.get('X-Header')).toBe('a');
    // Should work case insensitive
    expect(res.get('x-Header')).toBe('a');
    res.end()
  });

  it('can chain status method', done => {
    const res = new Response(null, out => {
      expect(out.statusCode).toBe(201);
      expect(res.statusCode).toBe(201);
      done()
    });
    res.status(201).end();
  });

  it('can chain set method', done => {
    const res = new Response(null, out => {
      expect(out.headers).toEqual({ 'x-header': 'a' });
      done()
    });
    res.set('x-header', 'a').end();
  });

  it('can chain type method', done => {
    const response = new Response(null, out => {
      expect(out.headers).toEqual({
        'content-type': 'text/xml'
      });
      done()
    });
    response.type('text/xml').end();
  });

  describe('should send correct response via accept header', () => {
    it('with regular header', done => {

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
      const res = new Response(req, out => {
        expect(out.statusCode).toBe(200);
        expect(out.headers['content-type']).toBe('text/xml');
        expect(out.body).toBe('<xml/>');
        done()
      });
      res.format({
        'application/json': (req, res, next) => {
          res.json({a: 1});
        },
        'text/xml': (req, res, next) => {
          res.send('<xml/>');
        }
      });
    });

    it('without regular header', done => {

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
      
      const res = new Response(req, out => {
        expect(out.statusCode).toBe(200);
        expect(out.headers['content-type']).toBe('text/html');
        expect(out.body).toBe('<p>hi</p>');
        done()
      });
      res.format({
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


    it('with non acceptable accept header', done => {
      expect.assertions(2);

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
        done()
      };

      const res = new Response(req, out => {
      });
      res.format({
        'application/json': (req, res, next) => {
          res.json({a: 1});
        }
      });
    });
  })
});

