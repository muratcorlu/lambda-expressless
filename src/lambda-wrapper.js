const { Response } = require('./response');
const { Request } = require('./request');

exports.use = (router) => {
  return (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const req = new Request(event);
    const response = new Response(request);
    request.res = response;

    router.handle(request, res, () => {
      // Set response to Lambda.
      // This will cause Lambda to freeze and should be executed last
      callback(response.responseObj)
    })
  }
}
