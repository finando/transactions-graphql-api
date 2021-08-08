import type { TransactionResolvers } from '@app/types';
import { Operation } from '@app/enums';

export const queries: TransactionResolvers[Operation.QUERY] = {
  getTransaction: async ({
    context: { userId, transactionService },
    input: { id }
  }) => transactionService.getTransaction(id, userId),
  listTransactions: async ({ context: { userId, transactionService } }) =>
    transactionService.listTransactions(userId)
};

export const mutations: TransactionResolvers[Operation.MUTATION] = {
  createTransaction: async ({
    context: { userId, transactionService },
    input: { data }
  }) => transactionService.createTransaction(userId, data),
  updateTransaction: async ({
    context: { userId, transactionService },
    input: { id, data }
  }) => transactionService.updateTransaction(id, userId, data),
  deleteTransaction: async ({
    context: { userId, transactionService },
    input: { id }
  }) => transactionService.deleteTransaction(id, userId)
};
