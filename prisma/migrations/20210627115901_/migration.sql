-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "fromAccount" DROP NOT NULL,
ALTER COLUMN "toAccount" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL;
