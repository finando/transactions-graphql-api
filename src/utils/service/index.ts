import type { PrismaClient } from '@prisma/client';
import type { Logger } from 'winston';

import { NotFoundError, PersistenceError } from '../../graphql/errors';

export abstract class Service {
  constructor(protected prisma: PrismaClient, protected logger: Logger) {}

  protected handleError(error: Error): Error {
    this.logger.error(error.message, { error });

    if (error instanceof NotFoundError) {
      return error;
    } else {
      return new PersistenceError('An unexpected persistence error occurred');
    }
  }
}
