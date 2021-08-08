import type { Transaction as TransactionDBO, Currency } from '@prisma/client';

export interface Transaction extends TransactionDBO {}

export interface CreateTransactionInput {
  fromAccount: string;
  toAccount: string;
  amount: number;
  currency: Currency;
  description?: string;
  tags?: string[];
}

export interface UpdateTransactionInput {
  fromAccount?: string;
  toAccount?: string;
  amount?: number;
  currency?: Currency;
  description?: string;
  tags?: string[];
}

export type { Transaction as TransactionDBO } from '@prisma/client';
