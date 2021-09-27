import type { BudgetAccountResolvers } from '@app/types';
import { Operation } from '@app/enums';

export const lookups: BudgetAccountResolvers[Operation.LOOKUP] = {
  balance: async ({
    context: { transactionService },
    root: { id, initialBalance }
  }) => transactionService.calculateAccountBalance(id, initialBalance)
};
