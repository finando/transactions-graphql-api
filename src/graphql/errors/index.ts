import { ApolloError } from 'apollo-server';

export class NotFoundError extends ApolloError {
  constructor(message: string) {
    super(message, 'NOT_FOUND');

    Object.defineProperty(this, 'name', { value: 'NotFoundError' });
  }
}

export class PersistenceError extends ApolloError {
  constructor(message: string) {
    super(message, 'PERSISTENCE_ERROR');

    Object.defineProperty(this, 'name', { value: 'PersistenceError' });
  }
}

export class NotAllowedError extends ApolloError {
  constructor(message: string) {
    super(message, 'NOT_ALLOWED_ERROR');

    Object.defineProperty(this, 'name', { value: 'NotAllowedError' });
  }
}

export class InternalServerError extends ApolloError {
  constructor(message: string) {
    super(message, 'INTERNAL_SERVER_ERROR');

    Object.defineProperty(this, 'name', { value: 'InternalServerError' });
  }
}

export {
  AuthenticationError,
  ForbiddenError,
  UserInputError
} from 'apollo-server';
