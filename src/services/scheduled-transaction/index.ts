import { Service } from '@app/utils/service';
import type {
  ScheduledTransaction,
  CreateScheduledTransactionInput,
  UpdateScheduledTransactionInput
} from '@app/types';

import { NotFoundError } from '../../graphql/errors';

class ScheduledTransactionService extends Service {
  public async getScheduledTransaction(
    id: string,
    userId: string
  ): Promise<ScheduledTransaction | null> {
    try {
      const scheduledTransaction =
        await this.prisma.scheduledTransaction.findFirst({
          include: { entries: true },
          where: { id, userId }
        });

      if (!scheduledTransaction || scheduledTransaction?.userId !== userId) {
        throw new NotFoundError(
          `Could not find scheduled transaction with ID: ${id} for user with ID: ${userId}`
        );
      }

      this.logger.info(
        `Found scheduled transaction with ID: ${id} for user with ID: ${userId}`
      );

      return scheduledTransaction;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async listScheduledTransactions(
    userId: string
  ): Promise<ScheduledTransaction[]> {
    try {
      const scheduledTransactions =
        await this.prisma.scheduledTransaction.findMany({
          include: { entries: true },
          where: { userId },
          orderBy: {
            createdAt: 'asc'
          }
        });

      this.logger.info(
        `Found ${scheduledTransactions.length} scheduled transactions for user with ID: ${userId}`
      );

      return scheduledTransactions;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async createScheduledTransaction(
    userId: string,
    {
      entries = [],
      recurrence,
      description,
      tags,
      createdAt
    }: CreateScheduledTransactionInput
  ): Promise<ScheduledTransaction> {
    try {
      const createdScheduledTransaction =
        await this.prisma.scheduledTransaction.create({
          include: { entries: true },
          data: {
            userId,
            entries: { createMany: { data: entries } },
            recurrence,
            description,
            tags,
            createdAt
          }
        });

      this.logger.info(
        `Successfully created scheduled transaction with ID: ${createdScheduledTransaction.id} for user with ID: ${userId}`
      );

      return createdScheduledTransaction;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async updateScheduledTransaction(
    id: string,
    userId: string,
    {
      entries,
      recurrence,
      description,
      tags,
      createdAt
    }: UpdateScheduledTransactionInput
  ): Promise<ScheduledTransaction | null> {
    try {
      await this.getScheduledTransaction(id, userId);

      const updatedScheduledTransaction =
        await this.prisma.scheduledTransaction.update({
          include: { entries: true },
          where: { id },
          data: {
            entries: {
              updateMany: entries?.map(({ id: entryId, ...entry }) => ({
                data: entry,
                where: { id: entryId, transactionId: id }
              }))
            },
            recurrence,
            description,
            tags,
            createdAt
          }
        });

      this.logger.info(
        `Successfully updated scheduled transaction with ID: ${updatedScheduledTransaction.id} for user with ID: ${userId}`
      );

      return updatedScheduledTransaction;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async deleteScheduledTransaction(
    id: string,
    userId: string
  ): Promise<ScheduledTransaction | null> {
    try {
      await this.getScheduledTransaction(id, userId);

      const deletedScheduledTransaction =
        await this.prisma.scheduledTransaction.delete({
          include: { entries: true },
          where: { id }
        });

      this.logger.info(
        `Successfully deleted scheduled transaction with ID: ${deletedScheduledTransaction.id} for user with ID: ${userId}`
      );

      return deletedScheduledTransaction;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export default ScheduledTransactionService;
