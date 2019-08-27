const { Response } = require('./response');
const { Request } = require('./request');

exports.use = (...handlers) => {
  return (event, context, callback) => {
    const request = new Request(event);
    const response = new Response(request, callback);

    handlers = [].concat(...handlers);

    handlers.reduce((chain, handler) => chain.then(
      () => new Promise((resolve) => handler(request, response, resolve))
    ).catch(callback), Promise.resolve());
  }
}
