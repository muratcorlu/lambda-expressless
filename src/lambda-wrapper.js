const { Response } = require('./response');
const { Request } = require('./request');

/**
 * API Gateway handler generator for Lambda
 *
 * @param {object} router Express compatible router instance
 * @param {function} finalHandler Process response before sending it. Function params: err, out, req, res
 * @return {function} Lambda handler for API gateway events
 * @public
 */

exports.ApiGatewayHandler = (router, finalHandler) => {
  /**
   * Lambda Handler for API Gateway invocations
   *
   * @param {object} event API Gateway event object
   * @param {object} context API Gateway context object
   * @return {promise} Returns undefined if callback param is set. Return a promise if callback param is undefined.
   */
  return handleApiGatewayEvent = (event, context) => {
    return new Promise((resolve, reject) => {
      try {
        const req = new Request(event);
        const res = req.res = new Response(req, out => {
          resolve(finalHandler(null, out, req, res))
        });

        // run middleware managed by router
        router(req, res, async err => {
          if (err) {
            // unexpected errors should be handled by final handler
            resolve(finalHandler(err, null, req, res))
          } else if (res.writableEnded) {
            console.error('ERROR: next() should not be used after res.send() within routing middleware');
          } else {
            // expected error
            res.status(404).send('Not found');
          }
        })
      } catch (error) {
        resolve(finalHandler(error, null, null, null))
      }
    })    
  }
}