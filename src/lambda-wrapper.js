const { Response } = require('./response');
const { Request } = require('./request');

exports.apiGatewayHandler = (router) => {
  return (event, context) => {
    return new Promise((resolve) => {

      const req = new Request(event);
      const res = new Response(req);
      req.res = res;
  
      router(req, res, (req, res) => {
        resolve(res.responseObj)
      })
    })
  }
}
