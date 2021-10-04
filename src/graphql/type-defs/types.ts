import { gql } from 'apollo-server';

export default gql`
  type Entry @key(fields: "id") {
    id: ID!
    account: ID!
    debit: NonNegativeInt!
    credit: NonNegativeInt!
    currency: Currency!
  }

  type Transaction @key(fields: "id") {
    id: ID!
    entries: [Entry!]!
    description: String
    tags: [Tag!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ScheduledTransaction @key(fields: "id") {
    id: ID!
    entries: [Entry!]!
    recurrence: Recurrence
    description: String
    tags: [Tag!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  extend type BudgetAccount @key(fields: "id") {
    id: ID! @external
    initialBalance: Int! @external
    balance: Int! @requires(fields: "initialBalance")
  }

  extend type TrackingAccount @key(fields: "id") {
    id: ID! @external
    initialBalance: Int! @external
    balance: Int! @requires(fields: "initialBalance")
  }
`;
