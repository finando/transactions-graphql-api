import type {
  TrackingAccountResolvers,
  FutureBalance,
  Balance
} from '@app/types';
import { Operation, Currency } from '@app/enums';

export const lookups: TrackingAccountResolvers[Operation.LOOKUP] = {
  balance: async ({
    context: { userId, transactionService, scheduledTransactionService },
    root: { id, initialBalance },
    input: { to, currency }
  }) =>
    (
      await Promise.all([
        transactionService.calculateAccountBalance(userId, id, to),
        scheduledTransactionService.calculateAccountBalance(userId, id, to)
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
    )
      .sort(({ date: a }, { date: b }) => a.getTime() - b.getTime())
      .map(({ date, balance }) => ({ date, balance: initialBalance + balance }))
};
