class Request {
  constructor(event) {
    let body = event.body;
    if (event.headers['Content-Type'] && event.headers['Content-Type'].indexOf('json') > -1) {
      body = JSON.parse(event.body);
    }

    this.method = event.httpMethod;
    this.query = event.queryStringParameters;
    this.path = event.path;
    this.params = event.pathParameters;
    this.headers = event.headers;

    this.body = event.body;
    if (this.is('json')) {
      this.body = JSON.parse(event.body);
    }
  }

  get(key) {
    return this.headers[key];
  }

  is(mimeType) {
    return this.get('Content-Type') && this.get('Content-Type').indexOf(mimeType) > -1;
  }
}

exports.Request = Request;
