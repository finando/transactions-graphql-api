import type { BudgetAccountResolvers, Balance } from '@app/types';
import { Operation, Currency } from '@app/enums';

export const lookups: BudgetAccountResolvers[Operation.LOOKUP] = {
  balance: async ({
    context: { userId, transactionService, scheduledTransactionService },
    root: { id, initialBalance },
    input: { to = new Date(), currency }
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
        date: to,
        currency: currency ?? Currency.NOK,
        cleared: initialBalance ?? 0,
        uncleared: 0,
        running: initialBalance ?? 0
      } as Balance
    ),
  balances: async ({
    context: { userId, transactionService, scheduledTransactionService },
    root: { id, initialBalance },
    input: { from, to = new Date(), frequency }
  }) =>
    Object.values(
      (
        await Promise.all([
          transactionService.listAccountBalances(
            userId,
            id,
            from,
            to,
            frequency
          ),
          scheduledTransactionService.listAccountBalances(
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
          (previous, { date, currency, cleared, uncleared, isScheduled }) => {
            const closestDate = isScheduled
              ? +(
                  Object.keys(previous)
                    .map(v => Number(v))
                    .sort()
                    .pop() ?? 0
                )
              : +date;

            const clearedBalance =
              (previous[closestDate]?.cleared ?? 0) + cleared;
            const unclearedBalance =
              (previous[closestDate]?.uncleared ?? 0) + uncleared;

            return {
              ...previous,
              [+date]: {
                date,
                currency,
                cleared: clearedBalance,
                uncleared: unclearedBalance,
                running: clearedBalance + unclearedBalance
              }
            };
          },
          {} as Record<number, Balance>
        )
    )
      .sort(({ date: a }, { date: b }) => a.getTime() - b.getTime())
      .map(({ cleared, uncleared, running, ...rest }) => ({
        ...rest,
        cleared: initialBalance + cleared,
        uncleared: uncleared,
        running: initialBalance + running
      }))
};
