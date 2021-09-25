import { resolvers as scalarResolvers } from 'graphql-scalars';
import { createRootResolver } from '@app/utils/common';

import {
  queries as transactionQueries,
  mutations as transactionMutations
} from './transaction';

export default {
  ...createRootResolver({ ...transactionQueries }, { ...transactionMutations }),
  ...scalarResolvers
};
