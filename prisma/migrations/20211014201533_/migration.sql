-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('CLEARED', 'UNCLEARED', 'RECONCILED');

-- AlterTable
ALTER TABLE "ScheduledTransaction" ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT E'UNCLEARED';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT E'CLEARED';
