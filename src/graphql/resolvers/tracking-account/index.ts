import type {
  TrackingAccountResolvers,
  FutureBalance,
  Balance
} from '@app/types';
import { Operation, Currency } from '@app/enums';

export const lookups: TrackingAccountResolvers[Operation.LOOKUP] = {
  newBalance: async ({
    context: { userId, transactionService, scheduledTransactionService },
    root: { id, initialBalance },
    input: { to, currency }
  }) =>
    (
      await Promise.all([
        transactionService.calculateNewAccountBalance(userId, id, to),
        scheduledTransactionService.calculateNewAccountBalance(userId, id, to)
      ])
    ).reduce(
      (previous, { cleared, uncleared, running }) => ({
        ...previous,
        cleared: previous.cleared + cleared,
        uncleared: previous.uncleared + uncleared,
        running: previous.running + running
      }),
      {
        date: to ?? new Date(),
        currency: currency ?? Currency.NOK,
        cleared: initialBalance ?? 0,
        uncleared: 0,
        running: 0
      } as Balance
    ),
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
