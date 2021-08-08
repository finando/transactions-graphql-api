import { ApolloServer } from 'apollo-server';

import logger from '@app/utils/logging';

import context from './graphql/context';
import plugins from './graphql/plugins';
import schema from './graphql/schema';
import onHealthCheck from './graphql/health-check';

export default new ApolloServer({
  context,
  plugins,
  schema,
  onHealthCheck,
  logger
});
