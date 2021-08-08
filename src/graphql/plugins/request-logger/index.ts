import type { ApolloServerPlugin } from 'apollo-server-plugin-base';

import logger, { requestTags } from '@app/utils/logging';
import type { Context } from '@app/types';

const plugin: ApolloServerPlugin<Context> = {
  requestDidStart: async ({ queryHash, context: { requestId } }) => {
    logger.debug('Request start', {
      tags: [...requestTags, 'start'],
      requestId,
      queryHash
    });

    return {
      willSendResponse: async ({ response: { http }, errors }) => {
        http?.headers.set('request-id', requestId);

        logger.debug('Request end', {
          tags: [...requestTags, 'end'],
          requestId,
          queryHash,
          errors: !!errors
        });
      }
    };
  }
};

export default plugin;
