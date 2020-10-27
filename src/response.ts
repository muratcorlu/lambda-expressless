import { EventEmitter } from 'events'
import { Request } from './request'
import { APIGatewayProxyCallback, APIGatewayProxyResult } from 'aws-lambda'

export class FormatError extends Error {
  status: number
  statusCode: number
  types: string[]
  constructor(message: string, status: number, types: string[]) {
    super(message)
    this.status = status
    this.statusCode = status
    this.types = types
  }
}

/**
 * Response Object
 */
export class Response extends EventEmitter {
  req: Request
  writableEnded: boolean
  statusCode: number
  expresslesOnFinished: APIGatewayProxyCallback
  expresslessResBody: unknown
  expresslessResHeaders: { [k: string]: string }
  expresslessResMultiValueHeaders: { [k: string]: string[] } | undefined;
  [k: string]: any
  /**
   * Response object constructor
   *
   * @param {Request} req Request object for this Response
   */
  constructor(req: Request, onFinished: APIGatewayProxyCallback) {
    super()
    this.req = req
    this.writableEnded = false
    this.statusCode = 200
    // Non-Express compatible props
    this.expresslessResHeaders = {}
    this.expresslessResMultiValueHeaders = undefined
    this.expresslessResBody = ''
    this.expresslesOnFinished = onFinished
  }

  /**
   * Ends the response process.
   */
  end() {
    // End must not be called twice to ensure compatibility with writable streams.
    // https://nodejs.org/api/stream.html#stream_writable_writableended
    if (this.writableEnded) throw new Error('write after end')
    this.writableEnded = true
    this.emit('finished')
    const body = this.expresslessResBody
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body)
    const apiGatewayResult: APIGatewayProxyResult = {
      statusCode: this.statusCode,
      headers: this.expresslessResHeaders,
      body: bodyStr
    }
    if (this.expresslessResMultiValueHeaders)
      apiGatewayResult.multiValueHeaders = this.expresslessResMultiValueHeaders
    this.expresslesOnFinished(null, apiGatewayResult)
  }

  /**
   * Get response header value for given key
   *
   * @param {string} key Header key to get
   */
  get(key: string) {
    return this.expresslessResHeaders[key.toLowerCase()]
  }

  /**
   * Performs content-negotiation on the Accept HTTP header
   * on the request object, when present. It uses `req.accepts()`
   * to select a handler for the request, based on the acceptable
   * types ordered by their quality values. If the header is not
   * specified, the first callback is invoked. When no match is
   * found, the server responds with 406 “Not Acceptable”, or invokes
   * the `default` callback.
   *
   * The `Content-Type` response header is set when a callback is
   * selected. However, you may alter this within the callback using
   * methods such as `res.set()` or `res.type()`.
   *
   * The following example would respond with `{ "message": "hey" }`
   * when the `Accept` header field is set to “application/json”
   * or “*\/json” (however if it is “*\/*”, then the response will
   * be “hey”).
   *
   *    res.format({
   *      'text/plain': function(){
   *        res.send('hey');
   *      },
   *
   *      'text/html': function(){
   *        res.send('<p>hey</p>');
   *      },
   *
   *      'appliation/json': function(){
   *        res.send({ message: 'hey' });
   *      }
   *    });
   *
   * By default it passes an `Error`
   * with a `.status` of 406 to `next(err)`
   * if a match is not made. If you provide
   * a `.default` callback it will be invoked
   * instead.
   *
   * @public
   */
  format(obj: { [k: string]: (req?: Request, res?: Response) => void }) {
    const defaultFn = obj.default
    const types = Object.keys(obj)
    let chosenType = this.req.accepts(...types)
    if (Array.isArray(chosenType)) {
      chosenType = chosenType[0]
    }

    if (chosenType) {
      this.type(chosenType)
      obj[chosenType](this.req, this)
    } else if (defaultFn) {
      return defaultFn(this.req, this)
    } else {
      var err = new FormatError('Not Acceptable', 406, types)
      this.expresslesOnFinished(err)
    }

    return this
  }

  /**
   * Sends a JSON response. This method sends a response (with the correct content-type) that is the parameter converted to a JSON string using JSON.stringify().
   *
   * The parameter can be any JSON type, including object, array, string, Boolean, number, or null, and you can also use it to convert other values to JSON.
   *
   * ```js
   * res.json(null)
   * res.json({ user: 'tobi' })
   * res.status(500).json({ error: 'message' })
   * ```
   * @param body Any type of oject
   */
  json(body: any) {
    this.set('Content-Type', 'application/json')
    this.send(JSON.stringify(body))
  }

  /**
   * Sends the HTTP response.
   */
  send(body: any) {
    this.expresslessResBody = body
    this.end()
  }

  /**
   * Set response header
   *
   * @param key Header key
   * @param value Header value
   */
  set(key: string, value: string) {
    this.expresslessResHeaders[key.toLowerCase()] = value
    return this
  }

  /**
   * Set cookie
   */
  cookie(
    key: string,
    value: string,
    options: {
      domain?: string
      expires?: Date
      maxAge?: number
      path?: string
      sameSite?: string
      httpOnly?: boolean
      secure?: boolean
      [k: string]: string | Date | boolean | number | undefined
    } = {}
  ) {
    if (!options['path']) {
      options['path'] = '/'
    }
    let cookieStr = `${key}=${value}`
    for (const optKey in options) {
      switch (optKey.toLocaleLowerCase()) {
        case 'domain':
          cookieStr += `; Domain=${options.domain}`
          break
        case 'expires':
          cookieStr += `; Expires=${options.expires?.toUTCString()}`
          break
        case 'maxage':
          cookieStr += `; Max-Age=${options[optKey]}`
          break
        case 'path':
          cookieStr += `; Path=${options[optKey]}`
          break
        case 'samesite':
          cookieStr += `; SameSite=${options[optKey]}`
          break
        case 'httponly':
          if (options[optKey]) {
            cookieStr += '; HttpOnly'
          }
          break
        case 'secure':
          if (options[optKey]) {
            cookieStr += '; Secure'
          }
          break
        default:
          console.warn(`Warning: Cookie paramterer ${optKey} not supported`)
      }
    }
    if (!this.expresslessResMultiValueHeaders) {
      this.expresslessResMultiValueHeaders = { 'Set-Cookie': [cookieStr] }
    } else {
      const cookies = this.expresslessResMultiValueHeaders['Set-Cookie'] || []
      cookies.push(cookieStr)
      this.expresslessResMultiValueHeaders['Set-Cookie'] = cookies
    }
    return this
  }

  /**
   * Set status code for response
   *
   * @param status Status code. Ex: 200, 201, 400, 404, 500 etc.
   */
  status(status: number) {
    this.statusCode = status
    return this
  }

  /**
   * Sets the Content-Type HTTP header
   *
   * @param type Mime type will be set as Content-Type response header
   */
  type(type: string) {
    this.set('Content-Type', type)
    return this
  }
}

exports.Response = Response
