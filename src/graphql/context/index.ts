import { v4 as uuid } from 'uuid';

import prisma from '@app/prisma';
import logger, { serviceTags } from '@app/utils/logging';
import { Context } from '@app/types';

import TransactionService from '@app/services/transaction';

export default async ({ req }): Promise<Context> => {
  const requestId = req.headers['request-id'] || uuid();
  const userId = 'az';

  return {
    requestId,
    userId,
    transactionService: new TransactionService(
      prisma,
      logger.child({ tags: [...serviceTags, 'transaction'], requestId, userId })
    )
  };
};
