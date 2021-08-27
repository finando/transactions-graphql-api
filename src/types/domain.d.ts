import type { Transaction as TransactionDBO, Currency } from '@prisma/client';

export interface Transaction extends TransactionDBO {}

export interface CreateTransactionInput {
  account: string;
  debit: number;
  credit: number;
  currency: Currency;
  description?: string;
  tags?: string[];
}

export interface UpdateTransactionInput {
  account?: string;
  debit?: number;
  credit?: number;
  currency?: Currency;
  description?: string;
  tags?: string[];
}

export type { Transaction as TransactionDBO } from '@prisma/client';
