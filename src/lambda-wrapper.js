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
    
    const req = new Request(event);
    const res = new Response(req);
    req.res = res;
    
    const onResFinished = new Promise(resolve => {
      res.on('finished', () => {
        console.log('finished')
        resolve (res.getApiGatewayResult())
      })
    })

    router(req, res, (err) => {
      console.log('router callback', err)
      if (err) {
        res.status(500).send(err)
      } else {
        res.status(404).send('Not found')
      }
    })
    
    if (callback) {
      onResFinished.then(apiGatewayResult => {
        context.callbackWaitsForEmptyEventLoop = false
        callback (null, apiGatewayResult)
      }).catch(err => {
        callback (err, null)
      })
      return undefined
    } else {
      return onResFinished
    }
  }
}
