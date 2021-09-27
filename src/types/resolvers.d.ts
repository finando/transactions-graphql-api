import type { Operation } from '@app/enums';

import type {
  Resolver,
  GetTransactionParams,
  ListTransactionsParams,
  UpdateTransactionParams,
  DeleteTransactionParams,
  Transaction,
  BudgetAccountRootObject,
  TrackingAccountRootObject
} from '.';

export interface TransactionResolvers {
  [Operation.QUERY]: {
    getTransaction: Resolver<GetTransactionParams, Transaction | null>;
    listTransactions: Resolver<ListTransactionsParams, Transaction[]>;
  };
  [Operation.MUTATION]: {
    createTransaction: Resolver<CreateTransactionParams, Transaction>;
    updateTransaction: Resolver<UpdateTransactionParams, Transaction | null>;
    deleteTransaction: Resolver<DeleteTransactionParams, Transaction | null>;
  };
}

export interface BudgetAccountResolvers {
  [Operation.LOOKUP]: {
    balance: Resolver<unknown, number, BudgetAccountRootObject>;
  };
}

export interface TrackingAccountResolvers {
  [Operation.LOOKUP]: {
    balance: Resolver<unknown, number, TrackingAccountRootObject>;
  };
}
