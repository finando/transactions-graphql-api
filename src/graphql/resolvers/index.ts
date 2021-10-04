import { resolvers as scalarResolvers } from 'graphql-scalars';

import { createRootResolver, createResolver } from '@app/utils/common';

import {
  queries as transactionQueries,
  mutations as transactionMutations
} from './transaction';
import {
  queries as scheduledTransactionQueries,
  mutations as scheduledTransactionMutations
} from './scheduled-transaction';
import { lookups as budgetAccountLookups } from './budget-account';
import { lookups as trackingAccountLookups } from './tracking-account';

export default {
  ...createRootResolver(
    { ...transactionQueries, ...scheduledTransactionQueries },
    { ...transactionMutations, ...scheduledTransactionMutations }
  ),
  BudgetAccount: createResolver({ ...budgetAccountLookups }),
  TrackingAccount: createResolver({ ...trackingAccountLookups }),
  ...scalarResolvers
};
