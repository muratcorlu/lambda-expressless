const { Request } = require('./request');

describe('Request object', () => {
  const requestObject = {a:1};
  const event = {
    body: JSON.stringify(requestObject),
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': JSON.stringify(requestObject).length
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

  it('should read header', () => {
    const request = new Request(event);

    expect(request.get('Content-Type')).toBe('application/json');
    expect(request.get('content-type')).toBe('application/json');
  });

  it('should handle weird header asks', () => {
    const request = new Request(event);

    expect(() => request.get()).toThrow(TypeError('name argument is required to req.get'));
    expect(() => request.get({})).toThrow(TypeError('name must be a string to req.get'));
  });

  it('should read referer/referrer header', () => {
    const referer = 'muratcorlu.com';
    event.headers['Referer'] = referer;

    const request = new Request(event);
    expect(request.get('referer')).toBe(referer);
    expect(request.get('referrer')).toBe(referer);
  })

  it('check type', () => {
    const request = new Request(event);
    expect(request.is('json')).toBe('json');
    expect(request.is(['html', 'json'])).toBe('json');
    expect(request.is('html', 'xml')).toBe(false);
  })

  it('should check accept header', () => {
    event.headers['Accept'] = 'application/json';

    const request = new Request(event);
    expect(request.accepts('xml')).toBe(false);
    expect(request.accepts('text/xml')).toBe(false);
    expect(request.accepts('json')).toBe('json');
    expect(request.accepts('application/json')).toBe('application/json');
    expect(request.accepts(['html', 'json'])).toBe('json');
  })

  it('should check acceptEncodings', () => {
    event.headers['accept-encoding'] = 'gzip, compress;q=0.2';

    const request = new Request(event);
    expect(request.acceptsEncodings('gzip', 'compress')).toBe('gzip');

  });

  it('should check acceptsCharsets', () => {
    event.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5';

    const request = new Request(event);
    expect(request.acceptsCharsets('utf-7', 'utf-8')).toBe('utf-8');

  });

  it('should check acceptsLanguages', () => {
    event.headers['accept-charset'] = 'en;q=0.8, es, tr';

    const request = new Request(event);
    expect(request.acceptsLanguages('tr', 'en')).toBe('tr');

  });
});
