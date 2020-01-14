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
   * @return {promise} Returns undefined if callback param is set. Return a promise if callback param is undefined.
   */
  return function handleApiGatewayEvent(event, context) {
    return new Promise((resolve, reject) => {
      const req = new Request(event);
      const res = new Response(req, resolve);
      req.res = res;
      // run middleware managed by router
      router(req, res, err => {
        if (err) {
          // unexpected errors
          reject(err);
        } else if (res.writableEnded) {
          console.error('ERROR: next() should not be used after res.send() within routing middleware')
        } else {
          // expected error
          res.status(404).send('Not found');
        }
      })
    })    
  }
}
