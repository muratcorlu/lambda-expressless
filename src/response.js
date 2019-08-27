/**
 * Response Object
 */
class Response {
  /**
   * Response object constructor
   *
   * @param {Request} req Request object for this Response
   * @param {function} callback AWS Lambda callback function
   */
  constructor(req, callback) {
    this.req = req;
    this.callback = callback;
    this.responseObj = {
      statusCode: 200,
      headers: {},
      body: ''
    };
  }

  /**
   * Ends the response process.
   */
  end() {
    this.callback(null, this.responseObj);
  }

  /**
   * Get response header value for given key
   *
   * @param {string} key Header key to get
   */
  get(key) {
    return this.responseObj.headers[key.toLowerCase()];
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
    this.responseObj.body = JSON.stringify(body);
    this.set('Content-Type', 'application/json');
    this.end();
  }

  /**
   * Sends the HTTP response.
   *
   * @param {any} body
   */
  send(body) {
    this.responseObj.body = body;
    this.end();
  }

  /**
   * Set response header
   *
   * @param {string} key Header key
   * @param {string} value Header value
   */
  set(key, value) {
    this.responseObj.headers[key.toLowerCase()] = value;
  }

  /**
   * Set status code for response
   *
   * @param {integer} status Status code. Ex: 200, 201, 400, 404, 500 etc.
   */
  status(status) {
    this.responseObj.statusCode = status;
  }

  /**
   * Sets the Content-Type HTTP header
   *
   * @param {string} type Mime type will be set as Content-Type response header
   */
  type(type) {
    this.set('Content-Type', type);
  }
}

exports.Response = Response;
