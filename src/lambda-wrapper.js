const { Response } = require('./response');
const { Request } = require('./request');

exports.apiGatewayHandler = (router) => {
  return function handleApiGatewayEvent(event, context) => {
    return new Promise((resolve) => {

      const req = new Request(event);
      const res = new Response(request);
      req.res = res;
  
      router.handle(req, res, () => {
        // Set response to Lambda.
        // This will cause Lambda to freeze and should be executed last
        resolve(res.responseObj)
      })
    })
  }
}
