import { createRootResolver } from '@app/utils/common';

import {
  queries as transactionQueries,
  mutations as transactionMutations
} from './transaction';

export default {
  ...createRootResolver({ ...transactionQueries }, { ...transactionMutations })
};
