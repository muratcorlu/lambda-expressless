const { Response } = require('./response');
const { Request } = require('./request');

/**
 * API Gateway handler generator for Lambda
 *
 * @param {object} router Express compatible router instance
 * @param {function} onFinished Last callback before output gets send. Function params: out, req, res
 * @return {function} Lambda handler for API gateway events
 * @public
 */

exports.ApiGatewayHandler = (router, onFinished) => {
  /**
   * Lambda Handler for API Gateway invocations
   *
   * @param {object} event API Gateway event object
   * @param {object} context API Gateway context object
   * @return {promise} Returns undefined if callback param is set. Return a promise if callback param is undefined.
   */
  return handleApiGatewayEvent = (event, context) => {
    return new Promise(resolve => {
      const req = new Request(event);
      const res = req.res = new Response(req, async out => {
        // run and wait for onFinished callback
        if (onFinished) try {
          out = await onFinished(out, req, res)
        } catch (err) {
          console.error('Error in onFinished callback: ', err)
        }
        // resolve promise even if onFinished callback errors out
        resolve(out)
      });
      router(req, res, (err) => {
        // handle generic routing errors
        // use error handling middleware for more granular control
        if (err) {
          console.error('ERROR: ', err)
          res.status(500).send('Server error')
        } else {
          res.status(404).send('Not found');
        }
      })
    })    
  }
}
