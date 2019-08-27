/**
 *
 */
class Request {
  constructor(event) {
    this.method = event.httpMethod;
    this.query = event.queryStringParameters;
    this.path = event.path;
    this.params = event.pathParameters;
    this.headers = Object.keys(event.headers).reduce((headers, key) => {
      headers[key.toLowerCase()] = event.headers[key];
      return headers;
    }, {});

    this.body = event.body;
    if (this.is('json')) {
      this.body = JSON.parse(event.body);
    }
  }

  get(key) {
    return this.headers[key.toLowerCase()];
  }

  is(mimeType) {
    return this.get('Content-Type') && this.get('Content-Type').indexOf(mimeType) > -1;
  }
}

exports.Request = Request;
