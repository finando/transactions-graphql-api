import type { Operation } from '@app/enums';

import type {
  Resolver,
  GetTransactionParams,
  ListTransactionsParams,
  ListLatestTransactionsParams,
  CreateTransactionParams,
  UpdateTransactionParams,
  DeleteTransactionParams,
  GetScheduledTransactionParams,
  ListScheduledTransactionsParams,
  CreateScheduledTransactionParams,
  UpdateScheduledTransactionParams,
  DeleteScheduledTransactionParams,
  BalanceParams,
  BalancesParams,
  Transaction,
  ScheduledTransaction,
  Balance,
  PagedResult,
  BudgetAccountRootObject,
  TrackingAccountRootObject
} from '.';

export interface TransactionResolvers {
  [Operation.QUERY]: {
    getTransaction: Resolver<GetTransactionParams, Transaction | null>;
    listTransactions: Resolver<ListTransactionsParams, Transaction[]>;
    listLatestTransactions: Resolver<
      ListLatestTransactionsParams,
      PagedResult<Transaction>
    >;
  };
  [Operation.MUTATION]: {
    createTransaction: Resolver<CreateTransactionParams, Transaction>;
    updateTransaction: Resolver<UpdateTransactionParams, Transaction | null>;
    deleteTransaction: Resolver<DeleteTransactionParams, Transaction | null>;
  };
}

export interface ScheduledTransactionResolvers {
  [Operation.QUERY]: {
    getScheduledTransaction: Resolver<
      GetScheduledTransactionParams,
      ScheduledTransaction | null
    >;
    listScheduledTransactions: Resolver<
      ListScheduledTransactionsParams,
      ScheduledTransaction[]
    >;
  };
  [Operation.MUTATION]: {
    createScheduledTransaction: Resolver<
      CreateScheduledTransactionParams,
      ScheduledTransaction
    >;
    updateScheduledTransaction: Resolver<
      UpdateScheduledTransactionParams,
      ScheduledTransaction | null
    >;
    deleteScheduledTransaction: Resolver<
      DeleteScheduledTransactionParams,
      ScheduledTransaction | null
    >;
  };
}

export interface BudgetAccountResolvers {
  [Operation.LOOKUP]: {
    balance: Resolver<BalanceParams, Balance, BudgetAccountRootObject>;
    balances: Resolver<BalancesParams, Balance[], BudgetAccountRootObject>;
  };
}

export interface TrackingAccountResolvers {
  [Operation.LOOKUP]: {
    balance: Resolver<BalanceParams, Balance, TrackingAccountRootObject>;
    balances: Resolver<BalancesParams, Balance[], BudgetAccountRootObject>;
  };
}
