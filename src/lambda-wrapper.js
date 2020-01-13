const { Response } = require('./response');
const { Request } = require('./request');

exports.use = (...handlers) => {
  return (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const request = new Request(event);
    const response = new Response(request, callback);
    request.res = response;

    handlers = [].concat(...handlers);

    handlers.reduce((chain, handler) => chain.then(
      () => new Promise((resolve) => {
        request.next = resolve;
        return handler(request, response, resolve);
      })
    ).catch(callback), Promise.resolve());

    // Set response to Lambda.
    // This will cause Lambda to freeze and should be executed last
    callback(response.responseObj)
  }
}
