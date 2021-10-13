/*
  Warnings:

  - You are about to drop the column `recurrence` on the `ScheduledTransaction` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'ANNUALLY');

-- AlterTable
ALTER TABLE "ScheduledTransaction" DROP COLUMN "recurrence",
ADD COLUMN     "frequency" "Frequency";

-- DropEnum
DROP TYPE "Recurrence";
