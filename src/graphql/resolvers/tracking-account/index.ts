import type { TrackingAccountResolvers, FutureBalance } from '@app/types';
import { Operation } from '@app/enums';

export const lookups: TrackingAccountResolvers[Operation.LOOKUP] = {
  balance: async ({
    context: { userId, transactionService },
    root: { id, initialBalance }
  }) =>
    transactionService.calculateFutureAccountBalance(
      userId,
      id,
      initialBalance
    ),
  futureBalance: async ({
    context: { userId, transactionService, scheduledTransactionService },
    root: { id, initialBalance },
    input: { to }
  }) => ({
    date: to,
    balance: (
      await Promise.all([
        transactionService.calculateFutureAccountBalance(
          userId,
          id,
          initialBalance
        ),
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
          (previous, { date, balance, isScheduled }) => ({
            ...previous,
            [+date]: {
              date,
              balance:
                (previous[
                  isScheduled
                    ? +(
                        Object.keys(previous)
                          .map(v => Number(v))
                          .sort()
                          .pop() ?? 0
                      )
                    : +date
                ]?.balance ?? 0) + balance
            }
          }),
          {} as Record<number, FutureBalance>
        )
    ).sort(({ date: a }, { date: b }) => a.getTime() - b.getTime())
};
