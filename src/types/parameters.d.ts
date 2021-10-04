import type {
  CreateTransactionInput,
  UpdateTransactionInput,
  CreateScheduledTransactionInput,
  UpdateScheduledTransactionInput
} from '.';

export interface GetTransactionParams {
  id: string;
}

export interface ListTransactionsParams {
  accountId?: string;
}

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

export interface GetScheduledTransactionParams {
  id: string;
}

export interface ListScheduledTransactionsParams {
  accountId?: string;
}

export interface CreateScheduledTransactionParams {
  data: CreateScheduledTransactionInput;
}

export interface UpdateScheduledTransactionParams {
  id: string;
  data: UpdateScheduledTransactionInput;
}

export interface DeleteScheduledTransactionParams {
  id: string;
}
