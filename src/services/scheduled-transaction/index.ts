import { Service } from '@app/utils/service';
import {
  mapToRecurrenceFrequency,
  calculateFrequencyMultiplier
} from '@app/utils/common';
import { localDateToUtc, getRecurringScheduledDates } from '@app/utils/date';
import type {
  ScheduledTransaction,
  FutureBalance,
  CreateScheduledTransactionInput,
  UpdateScheduledTransactionInput
} from '@app/types';
import { Frequency } from '@app/enums';

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
          `Could not find scheduled transaction with ID: ${id}`
        );
      }

      this.logger.info(`Found scheduled transaction with ID: ${id}`);

      return scheduledTransaction;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async listScheduledTransactions(
    userId: string,
    accountId?: string,
    toDate: Date = new Date()
  ): Promise<ScheduledTransaction[]> {
    try {
      const scheduledTransactions =
        await this.prisma.scheduledTransaction.findMany({
          include: { entries: true },
          where: {
            userId,
            entries: { some: { account: accountId } },
            createdAt: { lte: toDate }
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

      this.logger.info(
        `Found ${scheduledTransactions.length} scheduled transactions`,
        { accountId }
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
      frequency,
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
            frequency,
            description,
            tags,
            createdAt
          }
        });

      this.logger.info(
        `Successfully created scheduled transaction with ID: ${createdScheduledTransaction.id}`
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
      frequency,
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
            frequency,
            description,
            tags,
            createdAt
          }
        });

      this.logger.info(
        `Successfully updated scheduled transaction with ID: ${updatedScheduledTransaction.id}`
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
        `Successfully deleted scheduled transaction with ID: ${deletedScheduledTransaction.id}`
      );

      return deletedScheduledTransaction;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async calculateFutureAccountBalance(
    userId: string,
    accountId: string,
    toDate: Date,
    transactions?: ScheduledTransaction[]
  ): Promise<number> {
    return (
      Array.isArray(transactions)
        ? transactions
        : await this.listScheduledTransactions(userId, accountId)
    ).reduce(
      (previous, { entries, createdAt, frequency }) =>
        previous +
        entries.reduce(
          (previous, { account, debit, credit }) =>
            previous +
            (account === accountId
              ? calculateFrequencyMultiplier(createdAt, toDate, frequency) *
                (debit - credit)
              : 0),
          0
        ),
      0
    );
  }

  public async listFutureAccountBalances(
    userId: string,
    accountId: string,
    fromDate: Date,
    toDate: Date,
    frequency: Frequency = Frequency.DAILY
  ): Promise<FutureBalance[]> {
    const from = localDateToUtc(fromDate);
    const to = localDateToUtc(toDate);

    if (to.getTime() <= from.getTime()) {
      return [];
    }

    const transactions = await this.listScheduledTransactions(
      userId,
      accountId,
      toDate
    );

    const dates = getRecurringScheduledDates(
      from,
      to,
      mapToRecurrenceFrequency(frequency),
      transactions.map(({ createdAt }) => createdAt)
    );

    return transactions.length > 0
      ? Promise.all(
          dates.map(
            async date =>
              ({
                date,
                isScheduled: true,
                balance: await this.calculateFutureAccountBalance(
                  userId,
                  accountId,
                  date,
                  transactions
                )
              } as FutureBalance)
          )
        )
      : [];
  }
}

export default ScheduledTransactionService;
