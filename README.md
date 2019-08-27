# lambda-expressless (WIP)

[![Build Status](https://travis-ci.org/muratcorlu/lambda-expressless.svg?branch=master)](https://travis-ci.org/muratcorlu/lambda-expressless) [![npm version](https://badge.fury.io/js/lambda-expressless.svg)](https://www.npmjs.com/package/lambda-expressless) [![codecov](https://codecov.io/gh/muratcorlu/lambda-expressless/branch/master/graph/badge.svg)](https://codecov.io/gh/muratcorlu/lambda-expressless) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

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

You can also use multiple middlewares for a single handler:

```js
const { use } = require('lambda-expressless');

const checkUser = (req, res, next) => {
  if (req.get('Authorization') === 'someToken') {
    next()
  } else {
    req.status(403).end('Forbidden');
  }
};

const getUser = (req, res) => {
  res.json({
    id: '12',
    name: 'Murat'
  });
};

exports.handler = use(checkUser, getUser);
```

## Supported Features and Limitations

This project aims to implement functionalities of ExpressJS middlewares as much as possible. `Request` and `Response` objects have properties and methods listed below.

### Request Object

Properties:

| Property    | Notes |
|-------------|-------|
| [body](https://expressjs.com/en/4x/api.html#req.body) | - |
| [path](https://expressjs.com/en/4x/api.html#req.path) | - |
| [method](https://expressjs.com/en/4x/api.html#req.method) | - |
| [query](https://expressjs.com/en/4x/api.html#req.query) | Doesn't include repeated query parameters. |
| [params](https://expressjs.com/en/4x/api.html#req.params) | - |
| [headers](https://expressjs.com/en/4x/api.html#req.headers) | Doesn't include repeaded headers values |

Methods:

| Method    | Notes |
|-------------|-------|
| [get()](https://expressjs.com/en/4x/api.html#req.get) | - |
| [is()](https://expressjs.com/en/4x/api.html#req.is) | Doesn't support `*` wildcard checks(like `text/*`) |

### Response Object

Methods:

| Method    | Notes |
|-------------|-------|
| [get()](https://expressjs.com/en/4x/api.html#res.get) | - |
| [set()](https://expressjs.com/en/4x/api.html#res.set) | Only supports `key, value` parameters |
| [send()](https://expressjs.com/en/4x/api.html#res.send) | Only supports string values |
| [status()](https://expressjs.com/en/4x/api.html#res.status) | - |
| [end()](https://expressjs.com/en/4x/api.html#res.end) | - |
| [json()](https://expressjs.com/en/4x/api.html#res.json) | - |
| [type()](https://expressjs.com/en/4x/api.html#res.type) | - |
