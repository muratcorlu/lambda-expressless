const ReadableStream = require('stream').Readable;

/**
 *
 */
class Request extends ReadableStream {
  constructor(event) {
    super();
    this.headers = Object.keys(event.headers).reduce((headers, key) => {
      headers[key.toLowerCase()] = event.headers[key];
      return headers;
    }, {});
    this.hostname = this.headers.host
    this.method = event.httpMethod;
    this.query = event.queryStringParameters;
    this.path = event.path;
    this.params = event.pathParameters;

    this.protocol = this.get('X-Forwarded-Proto')
    this.secure = this.protocol === 'https';
    this.ips = (this.get('X-Forwarded-For') || '').split(', ');
    this.ip = this.ips[0];
    this.host = this.get('X-Forwarded-Host') || this.hostname;
    this.xhr = (this.get('X-Requested-With') || '').toLowerCase() === 'xmlhttprequest';

    this.event = event;

    this.push(event.body);
    this.push(null);
  }

  get(key) {
    return this.headers[key.toLowerCase()];
  }

  is(mimeType) {
    return this.get('Content-Type') && this.get('Content-Type').indexOf(mimeType) > -1;
  }
}

exports.Request = Request;
