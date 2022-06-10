const { Request } = require('./request')

describe('Request object', () => {
  const requestObject = { a: 1 }
  let event
  beforeEach(() => {
    event = {
      body: JSON.stringify(requestObject),
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify(requestObject).length,
        'X-Header': 'value2'
      },
      multiValueHeaders: {
        'Content-Type': ['application/json'],
        'Content-Length': [JSON.stringify(requestObject).length],
        'X-Header': ['value1', 'value2']
      },
      httpMethod: 'POST',
      isBase64Encoded: false,
      path: '/path',
      pathParameters: {},
      queryStringParameters: {
        a: '1',
        b: '2'
      },
      multiValueQueryStringParameters: {
        a: ['1'],
        b: ['1', '2']
      },
      stageVariables: {},
      requestContext: {},
      resource: ''
    }
  })

  it('should read query parameter', () => {
    const request = new Request(event)

    expect(request.query.a).toBe('1')
  })

  it('should read first value of query parameter with multiple values', () => {
    const request = new Request(event)

    expect(request.query.b).toEqual('1')
  })

  it('should read header', () => {
    const request = new Request(event)

    expect(request.get('Content-Type')).toBe('application/json')
    expect(request.get('content-type')).toBe('application/json')
  })

  it('should read first value of header with multiple values', () => {
    const request = new Request(event)

    expect(request.get('X-Header')).toEqual('value1')
  })

  it('should read query as empty object if there is no queryparamters', () => {
    delete event.multiValueQueryStringParameters
    event.queryStringParameters = {}
    const request = new Request(event)

    expect(request.query).toEqual({})
  })

  it('should read headers as empty object if there is no headers', () => {
    delete event.multiValueHeaders
    event.headers = {}
    delete event.body
    const request = new Request(event)

    expect(request.headers).toEqual({})
  })

  it('should handle weird header asks', () => {
    const request = new Request(event)

    expect(() => request.get()).toThrow(TypeError('name argument is required to req.get'))
    expect(() => request.get({})).toThrow(TypeError('name must be a string to req.get'))
  })

  it('should read referer/referrer header', () => {
    const referer = 'muratcorlu.com'
    event.headers['Referer'] = referer
    event.multiValueHeaders['Referer'] = [referer]

    const request = new Request(event)
    expect(request.get('referer')).toBe(referer)
    expect(request.get('referrer')).toBe(referer)
  })

  it('check type', () => {
    const request = new Request(event)
    expect(request.is('json')).toBe('json')
    expect(request.is(['html', 'json'])).toBe('json')
    expect(request.is('html', 'xml')).toBe(false)
  })

  it('should check accept header', () => {
    event.headers['Accept'] = 'application/json'
    event.multiValueHeaders['Accept'] = ['application/json']

    const request = new Request(event)
    expect(request.accepts('xml')).toBe(false)
    expect(request.accepts('text/xml')).toBe(false)
    expect(request.accepts('json')).toBe('json')
    expect(request.accepts('application/json')).toBe('application/json')
    expect(request.accepts(['html', 'json'])).toBe('json')
  })

  it('should check acceptEncodings', () => {
    event.headers['accept-encoding'] = 'gzip, compress;q=0.2'
    event.multiValueHeaders['accept-encoding'] = ['gzip, compress;q=0.2']

    const request = new Request(event)
    expect(request.acceptsEncodings('gzip', 'compress')).toBe('gzip')
  })

  it('should check acceptsCharsets', () => {
    event.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5'
    event.multiValueHeaders['accept-charset'] = ['utf-8, iso-8859-1;q=0.2, utf-7;q=0.5']

    const request = new Request(event)
    expect(request.acceptsCharsets('utf-7', 'utf-8')).toBe('utf-8')
  })

  it('should check acceptsLanguages', () => {
    event.headers['accept-charset'] = 'en;q=0.8, es, tr'
    event.multiValueHeaders['accept-charset'] = ['en;q=0.8, es, tr']

    const request = new Request(event)
    expect(request.acceptsLanguages('tr', 'en')).toBe('tr')
  })

  it('should handle content-length header if its not provided', () => {
    delete event.headers['Content-Length']
    delete event.multiValueHeaders['Content-Length']
    const body = JSON.stringify(requestObject)
    event.body = body

    const request = new Request(event)
    expect(request.get('content-length')).toBe(body.length.toString())
  })

  it('should handle non-ascii content-length if header is not provided', () => {
    delete event.headers['Content-Length']
    delete event.multiValueHeaders['Content-Length']

    event.body = JSON.stringify({ text: 'árvíztűrőtükörfúrógép😄' })
    const request = new Request(event)
    expect(request.get('content-length')).toBe('45')
  })

  it('should handle Japanese characters', () => {
    delete event.headers['Content-Length']
    delete event.multiValueHeaders['Content-Length']

    event.body = JSON.stringify('Tシャツを3 枚購入しました。')
    const request = new Request(event)
    expect(request.get('content-length')).toBe('41')
  })

  it('should handle special characters', () => {
    delete event.headers['Content-Length']
    delete event.multiValueHeaders['Content-Length']

    event.body = JSON.stringify('🇨🇭🇺🇸🇯🇵🇭🇺🇬🇷🇵🇱∃⇔€🎉')
    const request = new Request(event)
    expect(request.get('content-length')).toBe('63')
  })
})
