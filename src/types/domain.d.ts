import type {
  Currency,
  Tag,
  Frequency,
  Entry as EntryDBO,
  Transaction as TransactionDBO,
  ScheduledTransaction as ScheduledTransactionDBO
} from '@prisma/client';

export interface Entry extends EntryDBO {}

export interface Transaction extends TransactionDBO {
  entries: Entry[];
}

export interface ScheduledTransaction extends ScheduledTransactionDBO {
  entries: Entry[];
}

export interface Balance {
  date: Date;
  currency: Currency;
  cleared: number;
  uncleared: number;
  running: number;
  isScheduled?: boolean;
}

export interface PaginationInput {
  cursor: string;
  take: number;
}

export interface PagedResult<T> {
  data: T[];
  has_more: boolean;
}

export interface BudgetAccountRootObject {
  id: string;
  initialBalance: number;
}

export interface TrackingAccountRootObject {
  id: string;
  initialBalance: number;
}

export interface ListLatestTransactionsInput {
  accountId?: string;
  paginationInput?: PaginationInput;
}

export interface CreateEntryInput {
  account: string;
  debit: number;
  credit: number;
  currency: Currency;
}

export interface UpdateEntryInput {
  id: string;
  account?: string;
  debit?: number;
  credit?: number;
  currency?: Currency;
}

export interface CreateTransactionInput {
  entries?: CreateEntryInput[];
  description?: string;
  tags?: Tag[];
  createdAt?: Date;
}

export interface UpdateTransactionInput {
  entries?: UpdateEntryInput[];
  description?: string;
  tags?: Tag[];
  createdAt?: Date;
}

export interface CreateScheduledTransactionInput {
  entries?: CreateEntryInput[];
  frequency?: Frequency;
  description?: string;
  tags?: Tag[];
  createdAt?: Date;
}

export interface UpdateScheduledTransactionInput {
  entries?: UpdateEntryInput[];
  frequency?: Frequency;
  description?: string;
  tags?: Tag[];
  createdAt?: Date;
}

export type {
  Entry as EntryDBO,
  Transaction as TransactionDBO,
  ScheduledTransaction as ScheduledTransactionDBO
} from '@prisma/client';
