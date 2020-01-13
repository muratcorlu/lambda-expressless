const { Response } = require('./response');
const { Request } = require('./request');

exports.use = (router) => {
  return (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const req = new Request(event);
    const res = new Response(request);
    req.res = res;

    router.handle(req, res, () => {
      // Set response to Lambda.
      // This will cause Lambda to freeze and should be executed last
      callback(res.responseObj)
    })
  }
}
