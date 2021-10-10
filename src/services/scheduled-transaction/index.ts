import { RRule, Frequency } from 'rrule';

import { Service } from '@app/utils/service';
import type {
  ScheduledTransaction,
  CreateScheduledTransactionInput,
  UpdateScheduledTransactionInput
} from '@app/types';
import { Recurrence } from '@app/enums';

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
    accountId: string,
    userId: string,
    date: Date
  ): Promise<number> {
    return (await this.listScheduledTransactions(userId, accountId)).reduce(
      (previous, { entries, createdAt, recurrence }) =>
        previous +
        entries.reduce(
          (previous, { debit, credit }) =>
            previous +
            this.calculateRecurrenceMultiplier(createdAt, date, recurrence) *
              (debit - credit),
          0
        ),
      0
    );
  }

  private calculateRecurrenceMultiplier(
    fromDate: Date,
    toDate: Date,
    recurrence: Recurrence | null
  ): number {
    const now = this.localDateToUtc(new Date());
    const from = this.localDateToUtc(fromDate);
    const to = this.localDateToUtc(toDate);

    if (
      to.getTime() < from.getTime() ||
      to.getTime() <= now.getTime() ||
      !recurrence
    ) {
      return 0;
    }

    return new RRule({
      dtstart: from,
      until: to,
      freq: this.mapRecurrenceToFrequency(recurrence)
    }).all(date => date.getTime() >= now.getTime()).length;
  }

  private mapRecurrenceToFrequency(recurrence: Recurrence): Frequency {
    switch (recurrence) {
      case Recurrence.DAILY:
        return Frequency.DAILY;
      case Recurrence.WEEKLY:
        return Frequency.WEEKLY;
      case Recurrence.MONTHLY:
        return Frequency.MONTHLY;
      case Recurrence.ANNUALLY:
        return Frequency.YEARLY;
    }
  }

  private localDateToUtc(date: Date) {
    return new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds()
      )
    );
  }
}

export default ScheduledTransactionService;
