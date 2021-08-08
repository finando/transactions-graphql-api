import type { GraphQLResolveInfo } from 'graphql';

import TransactionService from '@app/services/transaction';

export interface Context {
  requestId: string;
  userId: string;
  transactionService: TransactionService;
}

interface Input<TRoot, TInput, TValue> {
  root: Readonly<TRoot>;
  input: Readonly<TInput>;
  value: Readonly<TValue>;
  context: Readonly<Context>;
  info: GraphQLResolveInfo;
}

export type Resolver<
  TParams,
  TOutput,
  TRoot = Record<string, unknown>,
  TValue = Record<string, unknown>
> = (input: Readonly<Input<TRoot, TParams, TValue>>) => Promise<TOutput>;
