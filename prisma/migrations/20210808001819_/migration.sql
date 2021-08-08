/*
  Warnings:

  - Made the column `fromAccount` on table `Transaction` required. This step will fail if there are existing NULL values in that column.
  - Made the column `toAccount` on table `Transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "fromAccount" SET NOT NULL,
ALTER COLUMN "toAccount" SET NOT NULL;
