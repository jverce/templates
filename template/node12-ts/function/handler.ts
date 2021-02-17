'use strict';

import { AsyncHandler, IFunctionContext, IFunctionEvent } from './types';

export const handler: AsyncHandler<IFunctionContext> = async (
  event: IFunctionEvent,
  context: IFunctionContext,
) => {
  const result = {
    'body': JSON.stringify(event.body),
    'content-type': event.headers['content-type'],
  };

  return context.status(200).succeed(result);
};
