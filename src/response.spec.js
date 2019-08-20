const { Response } = require('./response');

describe('Response object', () => {
  test('set response status properly', () => {
    const cb = jest.fn();

    const response = new Response(cb);

    response.status(404);
    response.end();

    expect(cb).toHaveBeenCalledWith(null, {
      statusCode: 404,
      headers: {},
      body: ''
    });
  });

  test('send body properly', () => {
    const cb = jest.fn();

    const response = new Response(cb);

    response.send('hello');

    expect(cb).toHaveBeenCalledWith(null, {
      statusCode: 200,
      headers: {},
      body: 'hello'
    });
  });
});

