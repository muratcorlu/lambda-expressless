import { Request } from './request'
import { Response } from './response'
import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

export interface Middleware {
  (request: Request, response: Response, next: (param?: unknown) => void): void
}

export interface OnFinishedHandler {
  (out: unknown, req: Request, res: Response): Promise<APIGatewayProxyResult>
}

/**
 * API Gateway handler generator for Lambda
 *
 * @param router Express compatible router instance
 * @param onFinished Last callback before output gets send. Function params: out, req, res
 * @return Lambda handler for API gateway events
 * @public
 */

exports.ApiGatewayHandler = (router: Middleware, onFinished: OnFinishedHandler) => {
  /**
   * Lambda Handler for API Gateway invocations
   *
   * @param {object} event API Gateway event object
   * @param {object} context API Gateway context object
   * @return {promise} Returns undefined if callback param is set. Return a promise if callback param is undefined.
   */
  const handleApiGatewayEvent: APIGatewayProxyHandler = function (event, context) {
    return new Promise(resolve => {
      const req = new Request(event)
      const res = (req.res = new Response(req, async (err, out) => {
        if (err) {
          console.error(err)
        }
        // run and wait for onFinished callback
        if (onFinished)
          try {
            out = await onFinished(err || out, req, res)
          } catch (err) {
            console.error('Error in onFinished callback: ', err)
          }
        // resolve promise even if onFinished callback errors out
        resolve(out)
      }))
      router(req, res, err => {
        // handle generic routing errors
        // use error handling middleware for more granular control
        if (err) {
          console.error('ERROR: ', err)
          res.status(500).send('Server error')
        } else {
          res.status(404).send('Not found')
        }
      })
    })
  }
  return handleApiGatewayEvent
}
