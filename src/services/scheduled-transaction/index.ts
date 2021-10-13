import { RRule } from 'rrule';

import { Service } from '@app/utils/service';
import { mapToRecurrenceFrequency } from '@app/utils/common';
import { localDateToUtc } from '@app/utils/date';
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
    accountId?: string
  ): Promise<ScheduledTransaction[]> {
    try {
      const scheduledTransactions =
        await this.prisma.scheduledTransaction.findMany({
          include: { entries: true },
          where: { userId, entries: { some: { account: accountId } } },
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
    date: Date
  ): Promise<number> {
    return (await this.listScheduledTransactions(userId, accountId)).reduce(
      (previous, { entries, createdAt, frequency }) =>
        previous +
        entries.reduce(
          (previous, { account, debit, credit }) =>
            previous +
            (account === accountId
              ? this.calculateFrequencyMultiplier(createdAt, date, frequency) *
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

    return Promise.all(
      new RRule({
        dtstart: from,
        until: to,
        freq: mapToRecurrenceFrequency(frequency)
      })
        .all()
        .map(async date => ({
          date,
          balance: await this.calculateFutureAccountBalance(
            userId,
            accountId,
            date
          )
        }))
    );
  }

  private calculateFrequencyMultiplier(
    fromDate: Date,
    toDate: Date,
    frequency: Frequency | null
  ): number {
    const now = localDateToUtc(new Date());
    const from = localDateToUtc(fromDate);
    const to = localDateToUtc(toDate);

    if (
      to.getTime() < from.getTime() ||
      to.getTime() <= now.getTime() ||
      !frequency
    ) {
      return 0;
    }

    return new RRule({
      dtstart: from,
      until: to,
      freq: mapToRecurrenceFrequency(frequency)
    }).all(date => date.getTime() >= now.getTime()).length;
  }
}

export default ScheduledTransactionService;
