# lambda-expressless (WIP)

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Wrap AWS Lambda functions with Express-like functions to simplify your code

So instead of writing this:

```js
exports.handler = (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const responseBody = {
    success: false,
    data: requestBody.id
  };

  callback(null, {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(responseBody)
  });
}
```

you'll have this:

```js
const { use } = require('lambda-expressless');

exports.handler = use((req, res) => {
  res.status(201).json({
    success: false,
    data: req.body.id
  })
});
```

