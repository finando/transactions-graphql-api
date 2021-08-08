import env from '@app/env';
import logger, { serverTags } from '@app/utils/logging';

import server from './server';

const { NODE_ENV: environment, HOST: host, PORT: port } = env;

server.listen({ host, port }).then(({ url }) => {
  logger.info(`Application is running at ${url} in ${environment} mode`, {
    tags: [...serverTags, 'start']
  });
});
