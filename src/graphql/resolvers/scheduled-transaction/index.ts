import type { ScheduledTransactionResolvers } from '@app/types';
import { Operation } from '@app/enums';

export const queries: ScheduledTransactionResolvers[Operation.QUERY] = {
  getScheduledTransaction: async ({
    context: { userId, scheduledTransactionService },
    input: { id }
  }) => scheduledTransactionService.getScheduledTransaction(id, userId),
  listScheduledTransactions: async ({
    context: { userId, scheduledTransactionService },
    input: { accountId }
  }) => scheduledTransactionService.listScheduledTransactions(userId, accountId)
};

export const mutations: ScheduledTransactionResolvers[Operation.MUTATION] = {
  createScheduledTransaction: async ({
    context: { userId, scheduledTransactionService },
    input: { data }
  }) => scheduledTransactionService.createScheduledTransaction(userId, data),
  updateScheduledTransaction: async ({
    context: { userId, scheduledTransactionService },
    input: { id, data }
  }) =>
    scheduledTransactionService.updateScheduledTransaction(id, userId, data),
  deleteScheduledTransaction: async ({
    context: { userId, scheduledTransactionService },
    input: { id }
  }) => scheduledTransactionService.deleteScheduledTransaction(id, userId)
};
