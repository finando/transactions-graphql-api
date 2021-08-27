/*
  Warnings:

  - You are about to drop the column `amount` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `fromAccount` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `toAccount` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `account` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "amount",
DROP COLUMN "fromAccount",
DROP COLUMN "toAccount",
ADD COLUMN     "account" TEXT NOT NULL,
ADD COLUMN     "credit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "debit" INTEGER NOT NULL DEFAULT 0;
