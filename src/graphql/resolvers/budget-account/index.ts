import type { BudgetAccountResolvers, FutureBalance } from '@app/types';
import { Operation } from '@app/enums';

export const lookups: BudgetAccountResolvers[Operation.LOOKUP] = {
  balance: async ({
    context: { userId, transactionService },
    root: { id, initialBalance }
  }) => transactionService.calculateAccountBalance(userId, id, initialBalance),
  futureBalance: async ({
    context: { userId, transactionService, scheduledTransactionService },
    root: { id, initialBalance },
    input: { to }
  }) => ({
    date: to,
    balance: (
      await Promise.all([
        transactionService.calculateAccountBalance(userId, id, initialBalance),
        scheduledTransactionService.calculateFutureAccountBalance(
          userId,
          id,
          to
        )
      ])
    ).reduce((previous, current) => previous + current, 0)
  }),
  futureBalances: async ({
    context: { userId, transactionService, scheduledTransactionService },
    root: { id, initialBalance },
    input: { from, to, frequency }
  }) =>
    Object.values(
      (
        await Promise.all([
          transactionService.listFutureAccountBalances(
            userId,
            id,
            initialBalance,
            from,
            to,
            frequency
          ),
          scheduledTransactionService.listFutureAccountBalances(
            userId,
            id,
            from,
            to,
            frequency
          )
        ])
      )
        .flat()
        .reduce(
          (previous, { date, balance }) => ({
            ...previous,
            [+date]: {
              date,
              balance: (previous[+date]?.balance ?? 0) + balance
            }
          }),
          {} as Record<number, FutureBalance>
        )
    ).sort(({ date: a }, { date: b }) => a.getTime() - b.getTime())
};
