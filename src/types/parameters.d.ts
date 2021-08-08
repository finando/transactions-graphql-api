import type { CreateTransactionInput, UpdateTransactionInput } from '.';

export interface GetTransactionParams {
  id: string;
}

export interface ListTransactionsParams {}

export interface CreateTransactionParams {
  data: CreateTransactionInput;
}

export interface UpdateTransactionParams {
  id: string;
  data: UpdateTransactionInput;
}

export interface DeleteTransactionParams {
  id: string;
}
