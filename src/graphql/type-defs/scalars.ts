import { gql } from 'apollo-server';
import { typeDefs as scalarTypeDefs } from 'graphql-scalars';

export default gql`
  ${scalarTypeDefs.join(' ')}
`;
