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
    status: TransactionStatus!
    description: String
    tags: [Tag!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ScheduledTransaction @key(fields: "id") {
    id: ID!
    entries: [Entry!]!
    status: TransactionStatus!
    frequency: Frequency
    description: String
    tags: [Tag!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type FutureBalance {
    date: DateTime!
    balance: Int!
  }

  type Balance {
    date: DateTime!
    currency: Currency!
    cleared: Int!
    uncleared: Int!
    running: Int!
  }

  extend type BudgetAccount @key(fields: "id") {
    id: ID! @external
    initialBalance: Int! @external
    balance(to: DateTime, currency: Currency): Balance!
      @requires(fields: "initialBalance")
    balances(
      from: DateTime
      to: DateTime
      frequency: Frequency
      currency: Currency
    ): [FutureBalance!]! @requires(fields: "initialBalance")
  }

  extend type TrackingAccount @key(fields: "id") {
    id: ID! @external
    initialBalance: Int! @external
    balance(to: DateTime, currency: Currency): Balance!
      @requires(fields: "initialBalance")
    balances(
      from: DateTime
      to: DateTime
      frequency: Frequency
      currency: Currency
    ): [FutureBalance!]! @requires(fields: "initialBalance")
  }
`;
