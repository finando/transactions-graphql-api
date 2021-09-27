import { gql } from 'apollo-server';

export default gql`
  input CreateEntryInput {
    account: ID!
    debit: NonNegativeInt!
    credit: NonNegativeInt!
    currency: Currency!
  }

  input UpdateEntryInput {
    id: ID!
    account: ID
    debit: NonNegativeInt
    credit: NonNegativeInt
    currency: Currency
  }

  input CreateTransactionInput {
    entries: [CreateEntryInput!]
    description: String
    tags: [Tag!]
    createdAt: DateTime!
  }

  input UpdateTransactionInput {
    entries: [UpdateEntryInput!]
    description: String
    tags: [Tag!]
    createdAt: DateTime
  }
`;
