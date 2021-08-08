import { buildFederatedSchema } from '@apollo/federation';

import resolvers from '../resolvers';
import typeDefs from '../type-defs';

const schema = buildFederatedSchema([{ typeDefs, resolvers }]);

export default schema;
