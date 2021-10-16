import { RRule } from 'rrule';

import { Service } from '@app/utils/service';
import { mapToRecurrenceFrequency } from '@app/utils/common';
import { localDateToUtc } from '@app/utils/date';
import type {
  Transaction,
  FutureBalance,
  CreateTransactionInput,
  UpdateTransactionInput
} from '@app/types';
import { Frequency } from '@app/enums';

import { NotFoundError } from '../../graphql/errors';

class TransactionService extends Service {
  public async getTransaction(
    id: string,
    userId: string
  ): Promise<Transaction | null> {
    try {
      const transaction = await this.prisma.transaction.findFirst({
        include: { entries: true },
        where: { id, userId }
      });

      if (!transaction || transaction?.userId !== userId) {
        throw new NotFoundError(`Could not find transaction with ID: ${id}`);
      }

      this.logger.info(`Found transaction with ID: ${id}`);

      return transaction;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async listTransactions(
    userId: string,
    accountId?: string
  ): Promise<Transaction[]> {
    try {
      const transactions = await this.prisma.transaction.findMany({
        include: { entries: true },
        where: { userId, entries: { some: { account: accountId } } },
        orderBy: {
          createdAt: 'asc'
        }
      });

      this.logger.info(`Found ${transactions.length} transactions`, {
        accountId
      });

      return transactions;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async createTransaction(
    userId: string,
    { entries = [], description, tags, createdAt }: CreateTransactionInput
  ): Promise<Transaction> {
    try {
      const createdTransaction = await this.prisma.transaction.create({
        include: { entries: true },
        data: {
          userId,
          entries: { createMany: { data: entries } },
          description,
          tags,
          createdAt
        }
      });

      this.logger.info(
        `Successfully created transaction with ID: ${createdTransaction.id}`
      );

      return createdTransaction;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async updateTransaction(
    id: string,
    userId: string,
    { entries, description, tags, createdAt }: UpdateTransactionInput
  ): Promise<Transaction | null> {
    try {
      await this.getTransaction(id, userId);

      const updatedTransaction = await this.prisma.transaction.update({
        include: { entries: true },
        where: { id },
        data: {
          entries: {
            updateMany: entries?.map(({ id: entryId, ...entry }) => ({
              data: entry,
              where: { id: entryId, transactionId: id }
            }))
          },
          description,
          tags,
          createdAt
        }
      });

      this.logger.info(
        `Successfully updated transaction with ID: ${updatedTransaction.id} for user with ID: ${userId}`
      );

      return updatedTransaction;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async deleteTransaction(
    id: string,
    userId: string
  ): Promise<Transaction | null> {
    try {
      await this.getTransaction(id, userId);

      const deletedTransaction = await this.prisma.transaction.delete({
        include: { entries: true },
        where: { id }
      });

      this.logger.info(
        `Successfully deleted transaction with ID: ${deletedTransaction.id}`
      );

      return deletedTransaction;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async calculateFutureAccountBalance(
    userId: string,
    accountId: string,
    initialBalance: number,
    date: Date = new Date()
  ): Promise<number> {
    const [
      {
        _sum: { debit }
      },
      {
        _sum: { credit }
      }
    ] = await this.prisma.$transaction([
      this.prisma.entry.aggregate({
        _sum: {
          debit: true
        },
        where: {
          account: accountId,
          transaction: { userId, createdAt: { lte: date } }
        }
      }),
      this.prisma.entry.aggregate({
        _sum: {
          credit: true
        },
        where: {
          account: accountId,
          transaction: { userId, createdAt: { lte: date } }
        }
      })
    ]);

    return (initialBalance ?? 0) + (debit ?? 0) - (credit ?? 0);
  }

  public async listFutureAccountBalances(
    userId: string,
    accountId: string,
    initialBalance: number,
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
            initialBalance,
            date
          )
        }))
    );
  }
}

export default TransactionService;
