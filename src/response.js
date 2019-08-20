class Response {
  constructor(callback) {
    this.callback = callback;
    this.responseObj = {
      statusCode: 200,
      headers: {},
      body: ''
    };
  }

  set(key, value) {
    this.responseObj.headers[key] = value;
  }
  status(status) {
    this.responseObj.statusCode = status;
  }

  send(body) {
    this.responseObj.body = body;
    this.end();
  }

  json(body) {
    this.responseObj.body = JSON.stringify(body);
    this.set('Content-Type', 'application/json');
    this.end();
  }

  end() {
    this.callback(null, this.responseObj);
  }
}

exports.Response = Response;
