import type { TrackingAccountResolvers } from '@app/types';
import { Operation } from '@app/enums';

export const lookups: TrackingAccountResolvers[Operation.LOOKUP] = {
  balance: async ({
    context: { transactionService },
    root: { id, initialBalance }
  }) => transactionService.calculateAccountBalance(id, initialBalance)
};
