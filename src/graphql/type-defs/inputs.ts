import { gql } from 'apollo-server';

export default gql`
  input CreateTransactionInput {
    account: String!
    debit: Int!
    credit: Int!
    currency: Currency!
    description: String
    tags: [String!]
  }

  input UpdateTransactionInput {
    account: String
    debit: Int
    credit: Int
    currency: Currency
    description: String
    tags: [String!]
  }
`;
