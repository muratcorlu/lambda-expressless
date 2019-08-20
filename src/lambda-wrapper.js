const { Response } = require('./response');

exports.use = (handler) => {
  return (event, context, callback) => {
    let body = event.body;
    if (event.headers['Content-Type'] && event.headers['Content-Type'].indexOf('json') > -1) {
      body = JSON.parse(event.body);
    }
    const request = {
      method: event.httpMethod,
      query: event.queryStringParameters,
      path: event.path,
      params: event.pathParameters,
      body: body,
      headers: event.headers
      // multiValueHeaders: {},
      // isBase64Encoded: boolean;
      // multiValueQueryStringParameters: { [name: string]: string[] } | null;
      // stageVariables: { [name: string]: string } | null;
      // requestContext: APIGatewayEventRequestContext;
      // resource: string;
    };

    const response = new Response(callback);

    try {
      handler(request, response);
    } catch (error) {
      callback(error);
    }
  }
}
