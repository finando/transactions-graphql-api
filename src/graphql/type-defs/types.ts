import { gql } from 'apollo-server';

export default gql`
  type Transaction @key(fields: "id") {
    id: ID!
    fromAccount: String!
    toAccount: String!
    amount: Int!
    currency: Currency!
    description: String
    tags: [String!]!
  }
`;
