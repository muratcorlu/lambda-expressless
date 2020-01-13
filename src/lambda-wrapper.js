const { Response } = require('./response');
const { Request } = require('./request');

/**
 * API Gateway handler generator for Lambda
 *
 * @param {object} router Express compatible router instance
 * @return {function} Lambda handler for API gateway events
 * @public
 */

exports.ApiGatewayHandler = (router) => {
  // TODO: check router param
  /**
   * Lambda Handler for API Gateway invocations
   *
   * @param {object} event API Gateway event object
   * @param {object} context API Gateway context object
   * @param {function} callback API Gateway callback function
   * @return {undefined|promise} Returns undefined if callback param is set. Return a promise if callback param is undefined.
   */
  return function handleApiGatewayEvent(event, context, callback) {
    const promise = new Promise((resolve, reject) => {
      context.callbackWaitsForEmptyEventLoop = false
      const req = new Request(event);
      const res = new Response(req);
      req.res = res;
      router(req, res, (err) => {
        const apiGatewayResult = res.getApiGatewayResult()
        if (callback) callback(err, apiGatewayResult)
        else if (err) reject(err) 
        else resolve(apiGatewayResult)
      })
    })
    return callback ? undefined : promise
  }
}