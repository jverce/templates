// Copyright (c) Alex Ellis 2021. All rights reserved.
// Copyright (c) OpenFaaS Author(s) 2021. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

'use strict';

import bodyParser from 'body-parser';
import express from 'express';
import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express-serve-static-core';

import { handler } from './function/handler';
import { IFunctionEvent, IFunctionContext, ICallback } from './function/types';

const defaultMaxSize = '100kb'; // body-parser default
const {
  http_port: port = 3000,
  MAX_RAW_SIZE: rawLimit = defaultMaxSize,
  MAX_JSON_SIZE: jsonLimit = defaultMaxSize,
  RAW_BODY: useRawBody,
} = process.env;

const app = express();
app.disable('x-powered-by');

const addDefaultContentType = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // When no content-type is given, the body element is set to
  // nil, and has been a source of contention for new users.
  const { 'content-type': contentType = 'text/plain' } = req.headers;
  req.headers = {
    ...req.headers,
    'content-type': contentType,
  };

  next();
};
app.use(addDefaultContentType);

if (useRawBody === 'true') {
  app.use(bodyParser.raw({ type: '*/*', limit: rawLimit }));
} else {
  app.use(bodyParser.text({ type: 'text/*' }));
  app.use(bodyParser.json({ limit: jsonLimit }));
  app.use(bodyParser.urlencoded({ extended: true }));
}

class FunctionEvent implements IFunctionEvent {
  body = '';
  headers = {};
  query: object;
  method: string;
  path: string;

  constructor(req: Request) {
    this.body = req.body;
    this.headers = req.headers;
    this.query = req.query;
    this.method = req.method;
    this.path = req.path;
  }
}

class FunctionContext implements IFunctionContext {
  value = 200;
  headerValues = {};
  cbCalled = 0;
  cb: ICallback = null;

  constructor(cb: ICallback) {
    this.cb = cb;
  }

  getStatus() {
    return this.value;
  }

  status(value: number) {
    this.value = value;
    return this;
  }

  getHeaders() {
    return this.headerValues;
  }

  headers(value: object) {
    this.headerValues = value;
    return this;
  }

  succeed(value: any) {
    let err;
    this.cbCalled++;
    this.cb(err, value);
    return this;
  }

  fail(value: any) {
    let message;
    this.cbCalled++;
    this.cb(value, message);
    return this;
  }
}

const isArray = Array.isArray;
const isObject = (a: any) => {
  return !!a && a.constructor === Object;
};
const shouldBeStringified = (obj: any) => isArray(obj) || isObject(obj);

const middleware: RequestHandler = async (req: Request, res: Response) => {
  const cb: ICallback = (err: any, functionResult: any) => {
    if (err) {
      const errPayload = err.toString ? err.toString() : err;
      console.error(errPayload);
      return res.status(500).send(errPayload);
    }

    const resultBody = shouldBeStringified(functionResult)
      ? JSON.stringify(functionResult)
      : functionResult;
    res
      .set(fnContext.getHeaders())
      .status(fnContext.getStatus())
      .send(resultBody);
  };

  const fnEvent = new FunctionEvent(req);
  const fnContext = new FunctionContext(cb);

  try {
    const handlerResponse = await handler(fnEvent, fnContext, cb);
    if (!fnContext.cbCalled) {
      fnContext.succeed(handlerResponse);
    }
  } catch (e) {
    cb(e);
  }
};

app.post('/*', middleware);
app.get('/*', middleware);
app.patch('/*', middleware);
app.put('/*', middleware);
app.delete('/*', middleware);
app.options('/*', middleware);

app.listen(port, () => {
  console.log(`node12-ts listening on port: ${port}`);
});
