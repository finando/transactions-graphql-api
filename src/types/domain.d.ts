import type {
  Transaction as TransactionDBO,
  Entry as EntryDBO,
  Currency,
  Tag
} from '@prisma/client';

export interface Entry extends EntryDBO {}

export interface Transaction extends TransactionDBO {
  entries: Entry[];
}

export interface BudgetAccountRootObject {
  id: string;
  initialBalance: number;
}

export interface TrackingAccountRootObject {
  id: string;
  initialBalance: number;
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

export type {
  Transaction as TransactionDBO,
  Entry as EntryDBO
} from '@prisma/client';
