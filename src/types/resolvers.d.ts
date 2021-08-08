import type { Operation as OperationType } from '@app/enums';

import type {
  Resolver,
  GetTransactionParams,
  ListTransactionsParams,
  UpdateTransactionParams,
  DeleteTransactionParams,
  Transaction
} from '.';

export interface TransactionResolvers {
  [OperationType.QUERY]: {
    getTransaction: Resolver<GetTransactionParams, Transaction | null>;
    listTransactions: Resolver<ListTransactionsParams, Transaction[]>;
  };
  [OperationType.MUTATION]: {
    createTransaction: Resolver<CreateTransactionParams, Transaction>;
    updateTransaction: Resolver<UpdateTransactionParams, Transaction | null>;
    deleteTransaction: Resolver<DeleteTransactionParams, Transaction | null>;
  };
}
