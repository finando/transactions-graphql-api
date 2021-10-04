export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production'
}

export enum Operation {
  QUERY = 'query',
  MUTATION = 'mutation',
  LOOKUP = 'lookup'
}

export { Currency, Recurrence } from '@prisma/client';
