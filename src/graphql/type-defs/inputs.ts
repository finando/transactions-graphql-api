import { gql } from 'apollo-server';

export default gql`
  input CreateTransactionInput {
    fromAccount: String!
    toAccount: String!
    amount: Int!
    currency: Currency!
    description: String
    tags: [String!]
  }

  input UpdateTransactionInput {
    fromAccount: String
    toAccount: String
    amount: Int
    currency: Currency
    description: String
    tags: [String!]
  }
`;
