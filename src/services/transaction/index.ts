import { Service } from '@app/utils/service';
import { mapToRecurrenceFrequency } from '@app/utils/common';
import { localDateToUtc, getRecurringDates } from '@app/utils/date';
import type {
  Transaction,
  Balance,
  FutureBalance,
  CreateTransactionInput,
  UpdateTransactionInput
} from '@app/types';
import { Frequency, Currency, TransactionStatus } from '@app/enums';

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
    accountId?: string,
    fromDate?: Date,
    toDate?: Date
  ): Promise<Transaction[]> {
    try {
      const transactions = await this.prisma.transaction.findMany({
        include: { entries: true },
        where: {
          userId,
          entries: { some: { account: accountId } },
          createdAt: { gte: fromDate, lte: toDate }
        },
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

    const [{ running: balance }, transactions] = await Promise.all([
      this.calculateAccountBalance(userId, accountId, fromDate),
      this.listTransactions(userId, accountId, fromDate, toDate)
    ]);

    const dates = getRecurringDates(
      from,
      to,
      mapToRecurrenceFrequency(frequency),
      transactions.map(({ createdAt }) => createdAt)
    );

    return Promise.all(
      dates.map(async date => ({
        date,
        balance:
          (await this.calculateFutureAccountBalance(
            userId,
            accountId,
            transactions.filter(
              ({ createdAt }) => createdAt.getTime() <= date.getTime()
            )
          )) + balance
      }))
    );
  }

  public async calculateAccountBalance(
    userId: string,
    accountId: string,
    toDate: Date = new Date(),
    currency: Currency = Currency.NOK
  ): Promise<Balance> {
    const [
      {
        _sum: { debit: clearedAndReconciledDebit }
      },
      {
        _sum: { credit: clearedAndReconciledCredit }
      },
      {
        _sum: { debit: unclearedDebit }
      },
      {
        _sum: { credit: unclearedCredit }
      }
    ] = await this.prisma.$transaction([
      this.prisma.entry.aggregate({
        _sum: {
          debit: true
        },
        where: {
          account: accountId,
          transaction: {
            userId,
            createdAt: { lte: toDate },
            status: {
              in: [TransactionStatus.CLEARED, TransactionStatus.RECONCILED]
            }
          }
        }
      }),
      this.prisma.entry.aggregate({
        _sum: {
          credit: true
        },
        where: {
          account: accountId,
          transaction: {
            userId,
            createdAt: { lte: toDate },
            status: {
              in: [TransactionStatus.CLEARED, TransactionStatus.RECONCILED]
            }
          }
        }
      }),
      this.prisma.entry.aggregate({
        _sum: {
          debit: true
        },
        where: {
          account: accountId,
          transaction: {
            userId,
            createdAt: { lte: toDate },
            status: TransactionStatus.UNCLEARED
          }
        }
      }),
      this.prisma.entry.aggregate({
        _sum: {
          credit: true
        },
        where: {
          account: accountId,
          transaction: {
            userId,
            createdAt: { lte: toDate },
            status: TransactionStatus.UNCLEARED
          }
        }
      })
    ]);

    const clearedBalance =
      (clearedAndReconciledDebit ?? 0) - (clearedAndReconciledCredit ?? 0);
    const unclearedBalance = (unclearedDebit ?? 0) - (unclearedCredit ?? 0);

    return {
      date: toDate,
      currency,
      cleared: clearedBalance,
      uncleared: unclearedBalance,
      running: clearedBalance + unclearedBalance
    };
  }

  private async calculateFutureAccountBalance(
    userId: string,
    accountId: string,
    transactions?: Transaction[]
  ): Promise<number> {
    return (
      Array.isArray(transactions)
        ? transactions
        : await this.listTransactions(userId, accountId)
    ).reduce(
      (previous, { entries }) =>
        previous +
        entries.reduce(
          (previous, { account, debit, credit }) =>
            previous + (account === accountId ? debit - credit : 0),
          0
        ),
      0
    );
  }
}

export default TransactionService;
