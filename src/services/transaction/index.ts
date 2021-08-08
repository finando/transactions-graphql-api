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
    data: CreateTransactionInput
  ): Promise<Transaction> {
    try {
      const transaction = await this.prisma.transaction.create({
        data: { ...data, userId }
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
    data: UpdateTransactionInput
  ): Promise<Transaction | null> {
    try {
      const updatedTransaction = await this.prisma.transaction.update({
        where: { id },
        data
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
      const deletedTransaction = await this.prisma.transaction.delete({
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
}

export default TransactionService;
