import type { TrackingAccountResolvers } from '@app/types';
import { Operation } from '@app/enums';

export const lookups: TrackingAccountResolvers[Operation.LOOKUP] = {
  balance: async ({
    context: { transactionService },
    root: { id, initialBalance }
  }) => transactionService.calculateAccountBalance(id, initialBalance),
  futureBalance: async ({
    context: { userId, transactionService, scheduledTransactionService },
    root: { id, initialBalance },
    input: { date }
  }) =>
    (
      await Promise.all([
        transactionService.calculateAccountBalance(id, initialBalance),
        scheduledTransactionService.calculateFutureAccountBalance(
          id,
          userId,
          date
        )
      ])
    ).reduce((previous, current) => previous + current, 0)
};
