import { IncomingHttpHeaders } from 'http2';
import { ParsedQs } from 'qs';

export type FunctionEventBody = string;
export type FunctionEventQuery = ParsedQs;
export type FunctionEventHeaders = IncomingHttpHeaders;
export interface IFunctionEvent {
  body: FunctionEventBody;
  headers: FunctionEventHeaders;
  query: FunctionEventQuery;
  method: string;
  path: string;
}

export type ICallback = (err: unknown, functionResult?: unknown) => unknown;

export interface IFunctionContext {
  getStatus: () => number;
  status: (value: number) => IFunctionContext;
  getHeaders: () => IncomingHttpHeaders;
  headers: (value: IncomingHttpHeaders) => IFunctionContext;
  succeed: (value: unknown) => IFunctionContext;
  fail: (value: unknown) => IFunctionContext;
}

export type Handler<T> = (
  event: IFunctionEvent,
  context: IFunctionContext,
  callback?: ICallback,
) => T;

export type AsyncHandler<T> = (
  event: IFunctionEvent,
  context: IFunctionContext,
  callback?: ICallback,
) => Promise<T>;
