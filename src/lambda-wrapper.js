
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

    let responseObj = {
      statusCode: 200,
      headers: {},
      body: ''
    };

    const response = {
      status: (status) => {
        responseObj.statusCode = status;
      },
      send: (body) => {
        responseObj.body = body;
        callback(null, responseObj);
      },
      json: (body) => {
        responseObj.body = JSON.stringify(body);
        responseObj.headers['Content-Type'] = 'application/json';
        callback(null, responseObj);
      },
      end: () => {
        callback(null, responseObj);
      }
    };

    try {
      handler(request, response);
    } catch (error) {
      callback(error);
    }
  }
}
