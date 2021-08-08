import { gql } from 'apollo-server';

import enums from './enums';
import types from './types';
import inputs from './inputs';

export default gql`
  ${enums}
  ${types}
  ${inputs}

  extend type Query {
    getTransaction(id: ID!): Transaction

    listTransactions: [Transaction!]!
  }

  extend type Mutation {
    createTransaction(data: CreateTransactionInput!): Transaction!

    updateTransaction(id: ID!, data: UpdateTransactionInput!): Transaction

    deleteTransaction(id: ID!): Transaction
  }
`;
