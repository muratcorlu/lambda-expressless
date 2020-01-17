const EventEmitter = require('events');

const AWS_RES_BODY = Symbol('body')
const AWS_RES_HEADERS = Symbol('body')
const ON_FINISHED = Symbol('body')

/**
 * Response Object
 */
class Response extends EventEmitter {
  /**
   * Response object constructor
   *
   * @param {Request} req Request object for this Response
   */
  constructor(req, onFinished) {
    super ()
    this.req = req;
    this.writableEnded = false
    this.statusCode = 200
    // Non-Express compatible props: Use symbols to avoid name clashes
    this[AWS_RES_HEADERS] = {}
    this[AWS_RES_BODY] = ''
    this[ON_FINISHED] = onFinished
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
    const body = this[AWS_RES_BODY]
    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body)
    const apiGatewayResult = {
      statusCode: this.statusCode,
      headers: this[AWS_RES_HEADERS],
      body: bodyStr
    }
    this[ON_FINISHED](apiGatewayResult)
  }

  /**
   * Get response header value for given key
   *
   * @param {string} key Header key to get
   */
  get(key) {
    return this[AWS_RES_HEADERS][key.toLowerCase()];
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
   * @param {Object} obj
   * @return {ServerResponse} for chaining
   * @public
   */
  format(obj) {
    const defaultFn = obj.default;
    const types = Object.keys(obj);
    const chosenType = this.req.accepts(types);

    if (chosenType) {
      this.type(chosenType);
      obj[chosenType](this.req, this, this.req.next);
    } else if (defaultFn) {
      return defaultFn(this.req, this, this.req.next);
    } else {
      var err = new Error('Not Acceptable');
      err.status = err.statusCode = 406;
      err.types = types;
      this.req.next(err);
    }

    return this;
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
   * @param {any} body Any type of oject
   */
  json(body) {
    this.set('Content-Type', 'application/json');
    this.send(JSON.stringify(body));
  }

  /**
   * Sends the HTTP response.
   *
   * @param {any} body
   */
  send(body) {
    this[AWS_RES_BODY] = body;
    this.end();
  }

  /**
   * Set response header
   *
   * @param {string} key Header key
   * @param {string} value Header value
   */
  set(key, value) {
    this[AWS_RES_HEADERS][key.toLowerCase()] = value;
    return this;
  }

  /**
   * Set status code for response
   *
   * @param {integer} status Status code. Ex: 200, 201, 400, 404, 500 etc.
   */
  status(status) {
    this.statusCode = status
    return this;
  }

  /**
   * Sets the Content-Type HTTP header
   *
   * @param {string} type Mime type will be set as Content-Type response header
   */
  type(type) {
    this.set('Content-Type', type);
    return this;
  }
}

exports.Response = Response;
