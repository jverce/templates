'use strict';

import {
  AsyncHandler,
  ICallback,
  IFunctionContext,
  IFunctionEvent,
} from './types';

export const handler: AsyncHandler = async (
  event: IFunctionEvent,
  context: IFunctionContext,
  callback?: ICallback,
): Promise<any> => {
  const result = {
    'body': JSON.stringify(event.body),
    'content-type': event.headers['content-type'],
  };

  return context.status(200).succeed(result);
};
