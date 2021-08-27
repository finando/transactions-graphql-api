import { gql } from 'apollo-server';

export default gql`
  type Transaction @key(fields: "id") {
    id: ID!
    account: ID!
    debit: Int!
    credit: Int!
    currency: Currency!
    description: String
    tags: [String!]!
  }
`;
