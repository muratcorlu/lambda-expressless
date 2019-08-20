const { Response } = require('./response');
const { Request } = require('./request');

exports.use = (handler) => {
  return (event, context, callback) => {
    const request = new Request(event);
    const response = new Response(callback);

    try {
      handler(request, response);
    } catch (error) {
      callback(error);
    }
  }
}
