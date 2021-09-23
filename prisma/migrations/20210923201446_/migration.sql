/*
  Warnings:

  - You are about to drop the column `account` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `credit` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `debit` on the `Transaction` table. All the data in the column will be lost.
  - The `tags` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Tag" AS ENUM ('INCOME', 'INCOME_PAYCHECK', 'INCOME_BONUS', 'INCOME_TAX_RETURN', 'INCOME_REIMBURSEMENT', 'INCOME_INTEREST', 'INCOME_RENTAL', 'INCOME_TRANSFER', 'INCOME_INVESTMENTS', 'INCOME_MISCELLANEOUS', 'EXPENSE', 'EXPENSE_HOUSING', 'EXPENSE_HOUSING_MORTGAGE', 'EXPENSE_HOUSING_RENT', 'EXPENSE_HOUSING_TAX', 'EXPENSE_HOUSING_REPAIR', 'EXPENSE_HOUSING_HOA_FEE', 'EXPENSE_HOUSING_APPLIANCES', 'EXPENSE_HOUSING_HOTEL', 'EXPENSE_HOUSING_DEPOSIT', 'EXPENSE_UTILITIES', 'EXPENSE_UTILITIES_WATER', 'EXPENSE_UTILITIES_ELECTRICITY', 'EXPENSE_UTILITIES_TRASH', 'EXPENSE_UTILITIES_CABLE', 'EXPENSE_UTILITIES_INTERNET', 'EXPENSE_UTILITIES_CELL_PHONE', 'EXPENSE_DEBT', 'EXPENSE_DEBT_STUDENT_LOAN', 'EXPENSE_DEBT_CREDIT_CARD', 'EXPENSE_DEBT_CAR_PAYMENT', 'EXPENSE_DEBT_MISCELLANEOUS', 'EXPENSE_PERSONAL_CARE', 'EXPENSE_PERSONAL_CARE_TOILETRIES', 'EXPENSE_PERSONAL_CARE_HAIRCUT', 'EXPENSE_PERSONAL_CARE_CLOTHING', 'EXPENSE_PERSONAL_CARE_SHOES', 'EXPENSE_PERSONAL_CARE_GYM_MEMBERSHIP', 'EXPENSE_PERSONAL_CARE_FOOD_SUPPLEMENTS', 'EXPENSE_INSURANCE', 'EXPENSE_INSURANCE_HOMEOWNER_INSURANCE', 'EXPENSE_INSURANCE_RENTER_INSURANCE', 'EXPENSE_INSURANCE_CAR', 'EXPENSE_INSURANCE_LIFE', 'EXPENSE_INSURANCE_HEALTH', 'EXPENSE_INSURANCE_DENTAL', 'EXPENSE_HEALTH_CARE', 'EXPENSE_HEALTH_CARE_PRIMARY', 'EXPENSE_HEALTH_CARE_DENTAL', 'EXPENSE_HEALTH_CARE_SPECIALTY', 'EXPENSE_HEALTH_CARE_URGENT', 'EXPENSE_HEALTH_CARE_MEDICATIONS', 'EXPENSE_HEALTH_CARE_MEDICAL_DEVICES', 'EXPENSE_TRANSPORTATION', 'EXPENSE_TRANSPORTATION_TOLL', 'EXPENSE_TRANSPORTATION_PUBLIC', 'EXPENSE_TRANSPORTATION_TAXI', 'EXPENSE_TRANSPORTATION_FUEL', 'EXPENSE_TRANSPORTATION_MAINTENANCE', 'EXPENSE_TRANSPORTATION_PARKING', 'EXPENSE_TRANSPORTATION_FEE', 'EXPENSE_TRANSPORTATION_PLANE_TICKETS', 'EXPENSE_FOOD', 'EXPENSE_FOOD_GROCERIES', 'EXPENSE_FOOD_RESTAURANT', 'EXPENSE_FOOD_COFFEE', 'EXPENSE_FOOD_FAST_FOOD', 'EXPENSE_FOOD_ALCOHOL', 'EXPENSE_FOOD_CANTEEN', 'EXPENSE_FOOD_DELIVERY', 'EXPENSE_FOOD_MISCELLANEOUS', 'EXPENSE_ENTERTAINMENT', 'EXPENSE_ENTERTAINMENT_SUBSCRIPTION', 'EXPENSE_ENTERTAINMENT_DRINKS', 'EXPENSE_ENTERTAINMENT_GAME', 'EXPENSE_ENTERTAINMENT_MOVIE', 'EXPENSE_ENTERTAINMENT_CONCERT', 'EXPENSE_ENTERTAINMENT_VACATION', 'EXPENSE_ENTERTAINMENT_CLUB', 'EXPENSE_ENTERTAINMENT_MISCELLANEOUS', 'EXPENSE_SHOPPING', 'EXPENSE_SHOPPING_BOOKS', 'EXPENSE_SHOPPING_ELECTRONICS', 'EXPENSE_SHOPPING_SOFTWARE', 'EXPENSE_SHOPPING_HOBBIES', 'EXPENSE_SHOPPING_SPORTS', 'EXPENSE_SHOPPING_FURNITURE', 'EXPENSE_SHOPPING_EDUCATION', 'EXPENSE_SHOPPING_MISCELLANEOUS', 'EXPENSE_MISCELLANEOUS', 'EXPENSE_MISCELLANEOUS_BANK_FEE', 'EXPENSE_MISCELLANEOUS_CREDIT_CARD_FEE', 'EXPENSE_MISCELLANEOUS_TAX', 'TRANSFER', 'TRANSFER_INVESTMENTS', 'TRANSFER_SAVINGS', 'TRANSFER_SAVINGS_FUTURE_EXPENSES', 'TRANSFER_SAVINGS_EMERGENCY', 'TRANSFER_SAVINGS_RETIREMENT', 'TRANSFER_SAVINGS_BSU');

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "account",
DROP COLUMN "credit",
DROP COLUMN "currency",
DROP COLUMN "debit",
DROP COLUMN "tags",
ADD COLUMN     "tags" "Tag"[];

-- CreateTable
CREATE TABLE "Entry" (
    "id" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "debit" INTEGER NOT NULL DEFAULT 0,
    "credit" INTEGER NOT NULL DEFAULT 0,
    "currency" "Currency" NOT NULL DEFAULT E'NOK',
    "transactionId" TEXT NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Entry" ADD FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
