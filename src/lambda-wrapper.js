const { Response } = require('./response');
const { Request } = require('./request');

const promisify = (handler, req, res) => new Promise((resolve, reject) => {
  try {
    handler(req, res, resolve);
  } catch (error) {
    reject(error);
  }
});

exports.use = (...handlers) => {
  return (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const request = new Request(event);
    const response = new Response(request);

    request.res = response;

    return new Promise((resolve, reject) => {

      response.promise.then(resolve, reject);

      [].concat(...handlers).reduce(
        (queue, handler) =>
          queue.then(() => promisify(handler, request, response)
        ),
        Promise.resolve()
      ).catch(reject);
    });
  }
}
