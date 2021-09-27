import { Service } from '@app/utils/service';
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput
} from '@app/types';

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
        throw new NotFoundError(
          `Could not find transaction with ID: ${id} for user with ID: ${userId}`
        );
      }

      this.logger.info(
        `Found transaction with ID: ${id} for user with ID: ${userId}`
      );

      return transaction;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async listTransactions(userId: string): Promise<Transaction[]> {
    try {
      const transactions = await this.prisma.transaction.findMany({
        include: { entries: true },
        where: { userId },
        orderBy: {
          createdAt: 'asc'
        }
      });

      this.logger.info(
        `Found ${transactions.length} transactions for user with ID: ${userId}`
      );

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
      const transaction = await this.prisma.transaction.create({
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
        `Successfully created transaction with ID: ${transaction.id} for user with ID: ${userId}`
      );

      return transaction;
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
        `Successfully deleted transaction with ID: ${deletedTransaction.id} for user with ID: ${userId}`
      );

      return deletedTransaction;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  public async calculateAccountBalance(
    accountId: string,
    initialBalance: number
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
        where: { account: accountId }
      }),
      this.prisma.entry.aggregate({
        _sum: {
          credit: true
        },
        where: { account: accountId }
      })
    ]);

    return (initialBalance ?? 0) + (debit ?? 0) - (credit ?? 0);
  }
}

export default TransactionService;
