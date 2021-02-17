import { IncomingHttpHeaders } from 'http2';
import { ParsedQs } from 'qs';

export interface IFunctionEvent {
  body: string;
  headers: IncomingHttpHeaders;
  query: ParsedQs;
  method: string;
  path: string;
}

export type ICallback = (err: any, functionResult?: any) => any;

export interface IFunctionContext {
  getStatus: () => number;
  status: (value: number) => IFunctionContext;
  getHeaders: () => object;
  headers: (value: object) => IFunctionContext;
  succeed: (value: any) => IFunctionContext;
  fail: (value: any) => IFunctionContext;
}

export type Handler = (
  event: IFunctionEvent,
  context: IFunctionContext,
  callback?: ICallback,
) => any;

export type AsyncHandler = (
  event: IFunctionEvent,
  context: IFunctionContext,
  callback?: ICallback,
) => Promise<any>;
