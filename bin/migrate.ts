import { writeFile } from 'fs';
import { resolve } from 'path';
import { readFile } from 'xlsx';
import { createInterface } from 'readline';
import { PrismaClient } from '@prisma/client';

interface Row {
  id: number | string;
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
  groupId?: number;
  description: string;
  tags: Tags[];
  isPending: boolean;
  createdDate: Date;
  updatedDate: Date;
}

interface Transaction {
  entries: Entry[];
  description: string;
  tags: Tags[];
  createdDate: Date;
  updatedDate: Date;
}

interface Entry {
  id: number | string;
  accountId: string;
  accountName: string;
  debit: number;
  credit: number;
  currency: 'NOK';
}

const processArguments = process.argv.slice(2);
const readLine = createInterface({
  input: process.stdin,
  output: process.stdout
});

const inputCommandIndex = processArguments.findIndex(v => v === '-i');
const inputPathArgument = processArguments[inputCommandIndex + 1];
const inputPath =
  inputCommandIndex != -1 && inputPathArgument?.endsWith('.xlsx')
    ? inputPathArgument
    : '';

if (!inputPath) {
  throw Error('Missing input file path');
}

const { Sheets: worksheets } = readFile(inputPath, {});

const transactionsSheet = worksheets['Transactions'];

const accounts = {
  'Nordea Credit Line': 'cksnp4pa701932k3r1i2ou271',
  'Storebrand Checking Account': 'cksnoqke700892k3ra21veqby',
  'Storebrand BSU': 'cksnotirx01392k3rofkuno3p',
  'Storebrand Fondskonto': 'cksnoz0k101502k3rprrblg7n',
  Coinbase: 'cksnpf6x102512k3ry4vhjywa',
  'Nordnet ASK': 'cksuce7s802812k3r5e1cxefe',
  'Capgemini Savings Scheme': 'cksnpeg5c02372k3rlf43wxax',
  'Storebrand Savings Account': 'cksnorfoj01282k3rfr5zp3oj',
  'Norwegian Credit Line': 'cksnpajs002152k3r66hmw5k9',
  'Trumf Visa': 'cksnpccyf02262k3ry2gb2u7w',
  'Storebrand ASK': 'cksnoz7wv01572k3rkzoweu9t',
  'Dfind ASK': 'cksnpesj002442k3rc4onpndq'
};

enum Tags {
  INCOME = 'INCOME',
  INCOME_PAYCHECK = 'INCOME_PAYCHECK',
  INCOME_BONUS = 'INCOME_BONUS',
  INCOME_TAX_RETURN = 'INCOME_TAX_RETURN',
  INCOME_REIMBURSEMENT = 'INCOME_REIMBURSEMENT',
  INCOME_INTEREST = 'INCOME_INTEREST',
  INCOME_RENTAL = 'INCOME_RENTAL',
  INCOME_TRANSFER = 'INCOME_TRANSFER',
  INCOME_INVESTMENTS = 'INCOME_INVESTMENTS',
  INCOME_MISCELLANEOUS = 'INCOME_MISCELLANEOUS',
  EXPENSE = 'EXPENSE',
  EXPENSE_HOUSING = 'EXPENSE_HOUSING',
  EXPENSE_HOUSING_MORTGAGE = 'EXPENSE_HOUSING_MORTGAGE',
  EXPENSE_HOUSING_RENT = 'EXPENSE_HOUSING_RENT',
  EXPENSE_HOUSING_TAX = 'EXPENSE_HOUSING_TAX',
  EXPENSE_HOUSING_REPAIR = 'EXPENSE_HOUSING_REPAIR',
  EXPENSE_HOUSING_HOA_FEE = 'EXPENSE_HOUSING_HOA_FEE',
  EXPENSE_HOUSING_APPLIANCES = 'EXPENSE_HOUSING_APPLIANCES',
  EXPENSE_HOUSING_HOTEL = 'EXPENSE_HOUSING_HOTEL',
  EXPENSE_HOUSING_DEPOSIT = 'EXPENSE_HOUSING_DEPOSIT',
  EXPENSE_UTILITIES = 'EXPENSE_UTILITIES',
  EXPENSE_UTILITIES_WATER = 'EXPENSE_UTILITIES_WATER',
  EXPENSE_UTILITIES_ELECTRICITY = 'EXPENSE_UTILITIES_ELECTRICITY',
  EXPENSE_UTILITIES_TRASH = 'EXPENSE_UTILITIES_TRASH',
  EXPENSE_UTILITIES_CABLE = 'EXPENSE_UTILITIES_CABLE',
  EXPENSE_UTILITIES_INTERNET = 'EXPENSE_UTILITIES_INTERNET',
  EXPENSE_UTILITIES_CELL_PHONE = 'EXPENSE_UTILITIES_CELL_PHONE',
  EXPENSE_DEBT = 'EXPENSE_DEBT',
  EXPENSE_DEBT_STUDENT_LOAN = 'EXPENSE_DEBT_STUDENT_LOAN',
  EXPENSE_DEBT_CREDIT_CARD = 'EXPENSE_DEBT_CREDIT_CARD',
  EXPENSE_DEBT_CAR_PAYMENT = 'EXPENSE_DEBT_CAR_PAYMENT',
  EXPENSE_DEBT_MISCELLANEOUS = 'EXPENSE_DEBT_MISCELLANEOUS',
  EXPENSE_PERSONAL_CARE = 'EXPENSE_PERSONAL_CARE',
  EXPENSE_PERSONAL_CARE_TOILETRIES = 'EXPENSE_PERSONAL_CARE_TOILETRIES',
  EXPENSE_PERSONAL_CARE_HAIRCUT = 'EXPENSE_PERSONAL_CARE_HAIRCUT',
  EXPENSE_PERSONAL_CARE_CLOTHING = 'EXPENSE_PERSONAL_CARE_CLOTHING',
  EXPENSE_PERSONAL_CARE_SHOES = 'EXPENSE_PERSONAL_CARE_SHOES',
  EXPENSE_PERSONAL_CARE_GYM_MEMBERSHIP = 'EXPENSE_PERSONAL_CARE_GYM_MEMBERSHIP',
  EXPENSE_PERSONAL_CARE_FOOD_SUPPLEMENTS = 'EXPENSE_PERSONAL_CARE_FOOD_SUPPLEMENTS',
  EXPENSE_INSURANCE = 'EXPENSE_INSURANCE',
  EXPENSE_INSURANCE_HOMEOWNER_INSURANCE = 'EXPENSE_INSURANCE_HOMEOWNER_INSURANCE',
  EXPENSE_INSURANCE_RENTER_INSURANCE = 'EXPENSE_INSURANCE_RENTER_INSURANCE',
  EXPENSE_INSURANCE_CAR = 'EXPENSE_INSURANCE_CAR',
  EXPENSE_INSURANCE_LIFE = 'EXPENSE_INSURANCE_LIFE',
  EXPENSE_INSURANCE_HEALTH = 'EXPENSE_INSURANCE_HEALTH',
  EXPENSE_INSURANCE_DENTAL = 'EXPENSE_INSURANCE_DENTAL',
  EXPENSE_HEALTH_CARE = 'EXPENSE_HEALTH_CARE',
  EXPENSE_HEALTH_CARE_PRIMARY = 'EXPENSE_HEALTH_CARE_PRIMARY',
  EXPENSE_HEALTH_CARE_DENTAL = 'EXPENSE_HEALTH_CARE_DENTAL',
  EXPENSE_HEALTH_CARE_SPECIALTY = 'EXPENSE_HEALTH_CARE_SPECIALTY',
  EXPENSE_HEALTH_CARE_URGENT = 'EXPENSE_HEALTH_CARE_URGENT',
  EXPENSE_HEALTH_CARE_MEDICATIONS = 'EXPENSE_HEALTH_CARE_MEDICATIONS',
  EXPENSE_HEALTH_CARE_MEDICAL_DEVICES = 'EXPENSE_HEALTH_CARE_MEDICAL_DEVICES',
  EXPENSE_TRANSPORTATION = 'EXPENSE_TRANSPORTATION',
  EXPENSE_TRANSPORTATION_TOLL = 'EXPENSE_TRANSPORTATION_TOLL',
  EXPENSE_TRANSPORTATION_PUBLIC = 'EXPENSE_TRANSPORTATION_PUBLIC',
  EXPENSE_TRANSPORTATION_TAXI = 'EXPENSE_TRANSPORTATION_TAXI',
  EXPENSE_TRANSPORTATION_FUEL = 'EXPENSE_TRANSPORTATION_FUEL',
  EXPENSE_TRANSPORTATION_MAINTENANCE = 'EXPENSE_TRANSPORTATION_MAINTENANCE',
  EXPENSE_TRANSPORTATION_PARKING = 'EXPENSE_TRANSPORTATION_PARKING',
  EXPENSE_TRANSPORTATION_FEE = 'EXPENSE_TRANSPORTATION_FEE',
  EXPENSE_TRANSPORTATION_PLANE_TICKETS = 'EXPENSE_TRANSPORTATION_PLANE_TICKETS',
  EXPENSE_FOOD = 'EXPENSE_FOOD',
  EXPENSE_FOOD_GROCERIES = 'EXPENSE_FOOD_GROCERIES',
  EXPENSE_FOOD_RESTAURANT = 'EXPENSE_FOOD_RESTAURANT',
  EXPENSE_FOOD_COFFEE = 'EXPENSE_FOOD_COFFEE',
  EXPENSE_FOOD_FAST_FOOD = 'EXPENSE_FOOD_FAST_FOOD',
  EXPENSE_FOOD_ALCOHOL = 'EXPENSE_FOOD_ALCOHOL',
  EXPENSE_FOOD_CANTEEN = 'EXPENSE_FOOD_CANTEEN',
  EXPENSE_FOOD_DELIVERY = 'EXPENSE_FOOD_DELIVERY',
  EXPENSE_FOOD_MISCELLANEOUS = 'EXPENSE_FOOD_MISCELLANEOUS',
  EXPENSE_ENTERTAINMENT = 'EXPENSE_ENTERTAINMENT',
  EXPENSE_ENTERTAINMENT_SUBSCRIPTION = 'EXPENSE_ENTERTAINMENT_SUBSCRIPTION',
  EXPENSE_ENTERTAINMENT_DRINKS = 'EXPENSE_ENTERTAINMENT_DRINKS',
  EXPENSE_ENTERTAINMENT_GAME = 'EXPENSE_ENTERTAINMENT_GAME',
  EXPENSE_ENTERTAINMENT_MOVIE = 'EXPENSE_ENTERTAINMENT_MOVIE',
  EXPENSE_ENTERTAINMENT_CONCERT = 'EXPENSE_ENTERTAINMENT_CONCERT',
  EXPENSE_ENTERTAINMENT_VACATION = 'EXPENSE_ENTERTAINMENT_VACATION',
  EXPENSE_ENTERTAINMENT_CLUB = 'EXPENSE_ENTERTAINMENT_CLUB',
  EXPENSE_ENTERTAINMENT_MISCELLANEOUS = 'EXPENSE_ENTERTAINMENT_MISCELLANEOUS',
  EXPENSE_SHOPPING = 'EXPENSE_SHOPPING',
  EXPENSE_SHOPPING_BOOKS = 'EXPENSE_SHOPPING_BOOKS',
  EXPENSE_SHOPPING_ELECTRONICS = 'EXPENSE_SHOPPING_ELECTRONICS',
  EXPENSE_SHOPPING_SOFTWARE = 'EXPENSE_SHOPPING_SOFTWARE',
  EXPENSE_SHOPPING_HOBBIES = 'EXPENSE_SHOPPING_HOBBIES',
  EXPENSE_SHOPPING_SPORTS = 'EXPENSE_SHOPPING_SPORTS',
  EXPENSE_SHOPPING_FURNITURE = 'EXPENSE_SHOPPING_FURNITURE',
  EXPENSE_SHOPPING_EDUCATION = 'EXPENSE_SHOPPING_EDUCATION',
  EXPENSE_SHOPPING_MISCELLANEOUS = 'EXPENSE_SHOPPING_MISCELLANEOUS',
  EXPENSE_MISCELLANEOUS = 'EXPENSE_MISCELLANEOUS',
  EXPENSE_MISCELLANEOUS_BANK_FEE = 'EXPENSE_MISCELLANEOUS_BANK_FEE',
  EXPENSE_MISCELLANEOUS_CREDIT_CARD_FEE = 'EXPENSE_MISCELLANEOUS_CREDIT_CARD_FEE',
  EXPENSE_MISCELLANEOUS_TAX = 'EXPENSE_MISCELLANEOUS_TAX',
  TRANSFER = 'TRANSFER',
  TRANSFER_INVESTMENTS = 'TRANSFER_INVESTMENTS',
  TRANSFER_SAVINGS = 'TRANSFER_SAVINGS',
  TRANSFER_SAVINGS_FUTURE_EXPENSES = 'TRANSFER_SAVINGS_FUTURE_EXPENSES',
  TRANSFER_SAVINGS_EMERGENCY = 'TRANSFER_SAVINGS_EMERGENCY',
  TRANSFER_SAVINGS_RETIREMENT = 'TRANSFER_SAVINGS_RETIREMENT',
  TRANSFER_SAVINGS_BSU = 'TRANSFER_SAVINGS_BSU'
}

const transactionTags = {
  PSN: [
    Tags.EXPENSE,
    Tags.EXPENSE_ENTERTAINMENT,
    Tags.EXPENSE_ENTERTAINMENT_SUBSCRIPTION
  ],
  'Credit card payment': [
    Tags.EXPENSE,
    Tags.EXPENSE_DEBT,
    Tags.EXPENSE_DEBT_CREDIT_CARD
  ],
  Food: [Tags.EXPENSE, Tags.EXPENSE_FOOD, Tags.EXPENSE_FOOD_GROCERIES],
  Microwave: [
    Tags.EXPENSE,
    Tags.EXPENSE_HOUSING,
    Tags.EXPENSE_HOUSING_APPLIANCES
  ],
  'Vacuum cleaner': [
    Tags.EXPENSE,
    Tags.EXPENSE_HOUSING,
    Tags.EXPENSE_HOUSING_APPLIANCES
  ],
  'Card fees': [
    Tags.EXPENSE,
    Tags.EXPENSE_MISCELLANEOUS,
    Tags.EXPENSE_MISCELLANEOUS_BANK_FEE
  ],
  Sushi: [Tags.EXPENSE, Tags.EXPENSE_FOOD, Tags.EXPENSE_FOOD_RESTAURANT],
  'Ice cream': [
    Tags.EXPENSE,
    Tags.EXPENSE_FOOD,
    Tags.EXPENSE_FOOD_MISCELLANEOUS
  ],
  'New SIM card': [
    Tags.EXPENSE,
    Tags.EXPENSE_SHOPPING,
    Tags.EXPENSE_SHOPPING_MISCELLANEOUS
  ],
  'Face cream': [
    Tags.EXPENSE,
    Tags.EXPENSE_PERSONAL_CARE,
    Tags.EXPENSE_PERSONAL_CARE_TOILETRIES
  ],
  'Transfer from Nordea': [Tags.INCOME, Tags.INCOME_TRANSFER],
  'Canteen money': [Tags.EXPENSE, Tags.EXPENSE_FOOD, Tags.EXPENSE_FOOD_CANTEEN],
  'Storebrand salary': [Tags.INCOME, Tags.INCOME_PAYCHECK],
  'Apartment rent': [
    Tags.EXPENSE,
    Tags.EXPENSE_HOUSING,
    Tags.EXPENSE_HOUSING_RENT
  ],
  'Plane tickets': [
    Tags.EXPENSE,
    Tags.EXPENSE_TRANSPORTATION,
    Tags.EXPENSE_TRANSPORTATION_PLANE_TICKETS
  ],
  'Food in Trondheim': [
    Tags.EXPENSE,
    Tags.EXPENSE_FOOD,
    Tags.EXPENSE_FOOD_RESTAURANT
  ],
  'Museum ticket in Trondheim': [
    Tags.EXPENSE,
    Tags.EXPENSE_ENTERTAINMENT,
    Tags.EXPENSE_ENTERTAINMENT_MISCELLANEOUS
  ],
  'Samfundet ticket': [
    Tags.EXPENSE,
    Tags.EXPENSE_ENTERTAINMENT,
    Tags.EXPENSE_ENTERTAINMENT_CLUB
  ],
  Flytoget: [
    Tags.EXPENSE,
    Tags.EXPENSE_TRANSPORTATION,
    Tags.EXPENSE_TRANSPORTATION_PUBLIC
  ],
  'Bus in Trondheim': [
    Tags.EXPENSE,
    Tags.EXPENSE_TRANSPORTATION,
    Tags.EXPENSE_TRANSPORTATION_PUBLIC
  ],
  'Flybuss in Trondheim': [
    Tags.EXPENSE,
    Tags.EXPENSE_TRANSPORTATION,
    Tags.EXPENSE_TRANSPORTATION_PUBLIC
  ],
  'Bus in Oslo': [
    Tags.EXPENSE,
    Tags.EXPENSE_TRANSPORTATION,
    Tags.EXPENSE_TRANSPORTATION_PUBLIC
  ],
  Pizza: [Tags.EXPENSE, Tags.EXPENSE_FOOD, Tags.EXPENSE_FOOD_FAST_FOOD],
  'Mac app': [
    Tags.EXPENSE,
    Tags.EXPENSE_SHOPPING,
    Tags.EXPENSE_SHOPPING_SOFTWARE
  ],
  Alcohol: [Tags.EXPENSE, Tags.EXPENSE_FOOD, Tags.EXPENSE_FOOD_ALCOHOL],
  Haircut: [
    Tags.EXPENSE,
    Tags.EXPENSE_PERSONAL_CARE,
    Tags.EXPENSE_PERSONAL_CARE_HAIRCUT
  ],
  Billiard: [
    Tags.EXPENSE,
    Tags.EXPENSE_ENTERTAINMENT,
    Tags.EXPENSE_ENTERTAINMENT_GAME
  ],
  'Vipps to Raz': [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  Lånekassen: [Tags.EXPENSE, Tags.EXPENSE_DEBT, Tags.EXPENSE_DEBT_STUDENT_LOAN],
  'Pop-corn in cinema': [
    Tags.EXPENSE,
    Tags.EXPENSE_ENTERTAINMENT,
    Tags.EXPENSE_ENTERTAINMENT_MISCELLANEOUS
  ],
  'New sneakers': [
    Tags.EXPENSE,
    Tags.EXPENSE_PERSONAL_CARE,
    Tags.EXPENSE_PERSONAL_CARE_SHOES
  ],
  'Vipps to Harun': [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  'Gym supplements': [
    Tags.EXPENSE,
    Tags.EXPENSE_PERSONAL_CARE,
    Tags.EXPENSE_PERSONAL_CARE_FOOD_SUPPLEMENTS
  ],
  'Debit card expenses': [
    Tags.EXPENSE,
    Tags.EXPENSE_MISCELLANEOUS,
    Tags.EXPENSE_MISCELLANEOUS_BANK_FEE
  ],
  'Debit card interest': [Tags.INCOME, Tags.INCOME_INTEREST],
  'Gym membership': [
    Tags.EXPENSE,
    Tags.EXPENSE_PERSONAL_CARE,
    Tags.EXPENSE_PERSONAL_CARE_GYM_MEMBERSHIP
  ],
  Parking: [
    Tags.EXPENSE,
    Tags.EXPENSE_TRANSPORTATION,
    Tags.EXPENSE_TRANSPORTATION_PARKING
  ],
  'Thermal paste': [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  'Hat for the winter': [
    Tags.EXPENSE,
    Tags.EXPENSE_PERSONAL_CARE,
    Tags.EXPENSE_PERSONAL_CARE_CLOTHING
  ],
  'Shuffle board': [
    Tags.EXPENSE,
    Tags.EXPENSE_ENTERTAINMENT,
    Tags.EXPENSE_ENTERTAINMENT_GAME
  ],
  Vipps: {
    debit: [Tags.INCOME, Tags.INCOME_REIMBURSEMENT],
    credit: [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS]
  },
  'Transfer to BSU account': [
    Tags.TRANSFER,
    Tags.TRANSFER_SAVINGS,
    Tags.TRANSFER_SAVINGS_BSU
  ],
  'Transfer from checking account': [Tags.INCOME, Tags.INCOME_TRANSFER],
  'TV streaming app': [
    Tags.EXPENSE,
    Tags.EXPENSE_SHOPPING,
    Tags.EXPENSE_SHOPPING_SOFTWARE
  ],
  'Credit card annual cost': [
    Tags.EXPENSE,
    Tags.EXPENSE_MISCELLANEOUS,
    Tags.EXPENSE_MISCELLANEOUS_CREDIT_CARD_FEE
  ],
  Taxi: [
    Tags.EXPENSE,
    Tags.EXPENSE_TRANSPORTATION,
    Tags.EXPENSE_TRANSPORTATION_TAXI
  ],
  Club: [
    Tags.EXPENSE,
    Tags.EXPENSE_ENTERTAINMENT,
    Tags.EXPENSE_ENTERTAINMENT_CLUB
  ],
  Drinks: [
    Tags.EXPENSE,
    Tags.EXPENSE_ENTERTAINMENT,
    Tags.EXPENSE_ENTERTAINMENT_DRINKS
  ],
  'Transfer to Storebrand Fondskonto': [
    Tags.TRANSFER,
    Tags.TRANSFER_INVESTMENTS
  ],
  Coffee: [Tags.EXPENSE, Tags.EXPENSE_FOOD, Tags.EXPENSE_FOOD_COFFEE],
  'Interest on BSU account': [Tags.INCOME, Tags.INCOME_INTEREST],
  'Interest on checking account': [Tags.INCOME, Tags.INCOME_INTEREST],
  'NSB tog': [
    Tags.EXPENSE,
    Tags.EXPENSE_TRANSPORTATION,
    Tags.EXPENSE_TRANSPORTATION_PUBLIC
  ],
  'Udemy course': [
    Tags.EXPENSE,
    Tags.EXPENSE_SHOPPING,
    Tags.EXPENSE_SHOPPING_EDUCATION
  ],
  'Gift to Ehsan': [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  Drink: [
    Tags.EXPENSE,
    Tags.EXPENSE_ENTERTAINMENT,
    Tags.EXPENSE_ENTERTAINMENT_DRINKS
  ],
  Cheesburger: [Tags.EXPENSE, Tags.EXPENSE_FOOD, Tags.EXPENSE_FOOD_FAST_FOOD],
  'Game coins': [
    Tags.EXPENSE,
    Tags.EXPENSE_ENTERTAINMENT,
    Tags.EXPENSE_ENTERTAINMENT_GAME
  ],
  Cryptocurrency: [Tags.TRANSFER, Tags.TRANSFER_INVESTMENTS],
  'Train ticket': [
    Tags.EXPENSE,
    Tags.EXPENSE_TRANSPORTATION,
    Tags.EXPENSE_TRANSPORTATION_PUBLIC
  ],
  'Shoe laces': [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  'Bank fees': [
    Tags.EXPENSE,
    Tags.EXPENSE_MISCELLANEOUS,
    Tags.EXPENSE_MISCELLANEOUS_BANK_FEE
  ],
  'Present to Ina': [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  'Movie tickets': [
    Tags.EXPENSE,
    Tags.EXPENSE_ENTERTAINMENT,
    Tags.EXPENSE_ENTERTAINMENT_MOVIE
  ],
  Transfer: {
    debit: [Tags.INCOME, Tags.INCOME_TRANSFER],
    credit: [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS]
  },
  Cafe: [Tags.EXPENSE, Tags.EXPENSE_FOOD, Tags.EXPENSE_FOOD_RESTAURANT],
  Other: [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  Dentist: [
    Tags.EXPENSE,
    Tags.EXPENSE_HEALTH_CARE,
    Tags.EXPENSE_HEALTH_CARE_DENTAL
  ],
  Flybussen: [
    Tags.EXPENSE,
    Tags.EXPENSE_TRANSPORTATION,
    Tags.EXPENSE_TRANSPORTATION_PUBLIC
  ],
  'Storebrand stocks': [Tags.INCOME, Tags.INCOME_INVESTMENTS],
  'Transaction fee': [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  Clothes: [
    Tags.EXPENSE,
    Tags.EXPENSE_PERSONAL_CARE,
    Tags.EXPENSE_PERSONAL_CARE_CLOTHING
  ],
  'Present to Henrik': [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  'Tax return': [Tags.INCOME, Tags.INCOME_TAX_RETURN],
  'Card fee': [
    Tags.EXPENSE,
    Tags.EXPENSE_MISCELLANEOUS,
    Tags.EXPENSE_MISCELLANEOUS_BANK_FEE
  ],
  'Gift to colleagues': [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  Trip: [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  Gambling: [
    Tags.EXPENSE,
    Tags.EXPENSE_ENTERTAINMENT,
    Tags.EXPENSE_ENTERTAINMENT_GAME
  ],
  Fee: [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  Hotel: [Tags.EXPENSE, Tags.EXPENSE_HOUSING, Tags.EXPENSE_HOUSING_HOTEL],
  Reimbursement: [Tags.INCOME, Tags.INCOME_REIMBURSEMENT],
  Restaurant: [Tags.EXPENSE, Tags.EXPENSE_FOOD, Tags.EXPENSE_FOOD_RESTAURANT],
  Wardrobe: [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  'iPhone battery replacement': [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  Lottery: [
    Tags.EXPENSE,
    Tags.EXPENSE_ENTERTAINMENT,
    Tags.EXPENSE_ENTERTAINMENT_MISCELLANEOUS
  ],
  'Annual fee': [
    Tags.EXPENSE,
    Tags.EXPENSE_MISCELLANEOUS,
    Tags.EXPENSE_MISCELLANEOUS_BANK_FEE
  ],
  Fun: [
    Tags.EXPENSE,
    Tags.EXPENSE_ENTERTAINMENT,
    Tags.EXPENSE_ENTERTAINMENT_MISCELLANEOUS
  ],
  Cinema: [
    Tags.EXPENSE,
    Tags.EXPENSE_ENTERTAINMENT,
    Tags.EXPENSE_ENTERTAINMENT_MOVIE
  ],
  'Spare part': [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  'Concert ticket': [
    Tags.EXPENSE,
    Tags.EXPENSE_ENTERTAINMENT,
    Tags.EXPENSE_ENTERTAINMENT_CONCERT
  ],
  Deposit: {
    debit: [Tags.INCOME, Tags.INCOME_TRANSFER],
    credit: [Tags.EXPENSE, Tags.EXPENSE_HOUSING, Tags.EXPENSE_HOUSING_DEPOSIT]
  },
  'Public transport': [
    Tags.EXPENSE,
    Tags.EXPENSE_TRANSPORTATION,
    Tags.EXPENSE_TRANSPORTATION_PUBLIC
  ],
  Suitcase: [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  Dividends: [Tags.INCOME, Tags.INCOME_INVESTMENTS],
  'Trading fee': [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  Tax: [
    Tags.EXPENSE,
    Tags.EXPENSE_MISCELLANEOUS,
    Tags.EXPENSE_MISCELLANEOUS_TAX
  ],
  Iron: [
    Tags.EXPENSE,
    Tags.EXPENSE_SHOPPING,
    Tags.EXPENSE_SHOPPING_ELECTRONICS
  ],
  IKEA: [Tags.EXPENSE, Tags.EXPENSE_SHOPPING, Tags.EXPENSE_SHOPPING_FURNITURE],
  Feriepenger: [Tags.INCOME, Tags.INCOME_PAYCHECK],
  'Capgemini salary': [Tags.INCOME, Tags.INCOME_PAYCHECK],
  Shoes: [
    Tags.EXPENSE,
    Tags.EXPENSE_PERSONAL_CARE,
    Tags.EXPENSE_PERSONAL_CARE_SHOES
  ],
  'Capgemini Savings Scheme': {
    debit: [Tags.INCOME, Tags.INCOME_TRANSFER],
    credit: [Tags.TRANSFER, Tags.TRANSFER_INVESTMENTS]
  },
  'Razor blade': [
    Tags.EXPENSE,
    Tags.EXPENSE_PERSONAL_CARE,
    Tags.EXPENSE_PERSONAL_CARE_TOILETRIES
  ],
  'Protein shake': [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  'Transfer to Storebrand Savings Account': [
    Tags.TRANSFER,
    Tags.TRANSFER_SAVINGS_FUTURE_EXPENSES
  ],
  Donation: [Tags.INCOME, Tags.INCOME_MISCELLANEOUS],
  Solarium: [Tags.EXPENSE, Tags.EXPENSE_PERSONAL_CARE],
  'Transfer to Nordnet ASK account': [Tags.TRANSFER, Tags.TRANSFER_INVESTMENTS],
  'AWS bill': [
    Tags.EXPENSE,
    Tags.EXPENSE_SHOPPING,
    Tags.EXPENSE_SHOPPING_SOFTWARE
  ],
  Lost: [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  'AirPods Pro': [
    Tags.EXPENSE,
    Tags.EXPENSE_SHOPPING,
    Tags.EXPENSE_SHOPPING_ELECTRONICS
  ],
  'Watch battery change': [
    Tags.EXPENSE,
    Tags.EXPENSE_SHOPPING,
    Tags.EXPENSE_SHOPPING_ELECTRONICS
  ],
  Sunglasses: [Tags.EXPENSE, Tags.EXPENSE_SHOPPING],
  'Credit limit decrease': [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  Inheritance: [Tags.INCOME, Tags.INCOME_MISCELLANEOUS],
  'Face masks': [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  Cashback: [Tags.INCOME, Tags.INCOME_MISCELLANEOUS],
  Tools: [Tags.EXPENSE, Tags.EXPENSE_SHOPPING],
  'Present for mom': [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  'Capgemini final settlement': [Tags.INCOME, Tags.INCOME_PAYCHECK],
  'Bouvet salary': [Tags.INCOME, Tags.INCOME_PAYCHECK],
  'Interest on savings account': [Tags.INCOME, Tags.INCOME_INTEREST],
  'Hostgator bill': [
    Tags.EXPENSE,
    Tags.EXPENSE_SHOPPING,
    Tags.EXPENSE_SHOPPING_SOFTWARE
  ],
  'Transfer to Storebrand ASK account': [
    Tags.TRANSFER,
    Tags.TRANSFER_INVESTMENTS
  ],
  'WOW subscription': [
    Tags.EXPENSE,
    Tags.EXPENSE_ENTERTAINMENT,
    Tags.EXPENSE_ENTERTAINMENT_GAME
  ],
  'Credit limit increase': [Tags.INCOME, Tags.INCOME_MISCELLANEOUS],
  ESOP: [Tags.TRANSFER, Tags.TRANSFER_INVESTMENTS],
  'OBOS membership': [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  'Hotel refund': [Tags.INCOME, Tags.INCOME_REIMBURSEMENT],
  "Doctor's appointment": [
    Tags.EXPENSE,
    Tags.EXPENSE_HEALTH_CARE,
    Tags.EXPENSE_HEALTH_CARE_PRIMARY
  ],
  Perfume: [Tags.EXPENSE, Tags.EXPENSE_SHOPPING],
  Accessories: [Tags.EXPENSE, Tags.EXPENSE_SHOPPING],
  'Food delivery': [
    Tags.EXPENSE,
    Tags.EXPENSE_FOOD,
    Tags.EXPENSE_FOOD_DELIVERY
  ],
  'Gift for mom': [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  Posten: [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  'Phone bill': [
    Tags.EXPENSE,
    Tags.EXPENSE_UTILITIES,
    Tags.EXPENSE_UTILITIES_CELL_PHONE
  ],
  'Bouvet feriepenger': [Tags.INCOME, Tags.INCOME_PAYCHECK],
  'Wine glasses': [Tags.EXPENSE, Tags.EXPENSE_SHOPPING],
  'Bus in Stavanger': [
    Tags.EXPENSE,
    Tags.EXPENSE_TRANSPORTATION,
    Tags.EXPENSE_TRANSPORTATION_PUBLIC
  ],
  'Dfind salary': [Tags.INCOME, Tags.INCOME_PAYCHECK],
  Vacation: [
    Tags.EXPENSE,
    Tags.EXPENSE_ENTERTAINMENT,
    Tags.EXPENSE_ENTERTAINMENT_VACATION
  ],
  'Return claim': [Tags.INCOME, Tags.INCOME_MISCELLANEOUS],
  'Transfer from Nordnet ASK account': [
    Tags.TRANSFER,
    Tags.TRANSFER_INVESTMENTS
  ],
  Usage: [Tags.EXPENSE, Tags.EXPENSE_MISCELLANEOUS],
  'Dfind RSPP contribution': [Tags.INCOME, Tags.INCOME_INVESTMENTS],
  'Mortgage payment': [
    Tags.EXPENSE,
    Tags.EXPENSE_HOUSING,
    Tags.EXPENSE_HOUSING_MORTGAGE
  ],
  'Transfer from BSU account': [
    Tags.TRANSFER,
    Tags.TRANSFER_SAVINGS,
    Tags.TRANSFER_SAVINGS_BSU
  ],
  'Capital gains': [Tags.INCOME, Tags.INCOME_INVESTMENTS],
  'Transfer from Storebrand Fondskonto account': [
    Tags.TRANSFER,
    Tags.TRANSFER_INVESTMENTS
  ],
  'Transfer from Storebrand ASK account': [
    Tags.TRANSFER,
    Tags.TRANSFER_INVESTMENTS
  ],
  'Down payment': [
    Tags.EXPENSE,
    Tags.EXPENSE_HOUSING,
    Tags.EXPENSE_HOUSING_MORTGAGE
  ],
  'iPhone 13': [
    Tags.EXPENSE,
    Tags.EXPENSE_SHOPPING,
    Tags.EXPENSE_SHOPPING_ELECTRONICS
  ]
};

const rows = Object.entries(transactionsSheet).reduce(
  (previous, [key, value]) => {
    const [column, row] = key.split(/([a-zA-Z]+)(\d+)/).slice(1, 3);

    if (Number(row) === 1 || !column || !row) {
      return previous;
    }

    if (!(row in previous)) {
      previous[row] = {};
    }

    if (column.startsWith('A')) {
      previous[row].id = value.v ?? Number(row) - 1;
      previous[row].isPending = !value.v;
    } else if (column.startsWith('B')) {
      previous[row].createdDate = new Date(`${value.w} UTC`);
      previous[row].updatedDate = new Date(`${value.w} UTC`);
    } else if (column.startsWith('C')) {
      previous[row].accountId = accounts[value.v.trim()];
      previous[row].accountName = value.v.trim();
    } else if (column.startsWith('D')) {
      previous[row].debit = Math.round((value.v ?? 0) * 100);
      if (isNaN(Math.round((value.v ?? 0) * 100))) {
        console.error(value);
      }
    } else if (column.startsWith('E')) {
      previous[row].credit = Math.round((value.v ?? 0) * 100);
      if (isNaN(Math.round((value.v ?? 0) * 100))) {
        console.error(value);
      }
    } else if (column.startsWith('G')) {
      previous[row].description = value.v.trim();
    } else if (column.startsWith('H')) {
      previous[row].groupId = value.v;
    }

    return previous;
  },
  {} as Record<string, Partial<Row>>
);

const transactions = Object.values(rows)
  .filter(({ isPending = true }) => !isPending)
  .map(({ id, groupId, ...rest }) => ({
    id,
    groupId,
    compositeId: groupId ? groupId.toString() : `single-${id}`,
    ...rest
  }))
  .reduce(
    (
      previous,
      {
        id,
        compositeId,
        accountId,
        accountName,
        debit = 0,
        credit = 0,
        description = '',
        createdDate,
        updatedDate
      }
    ) => {
      const tags = Array.isArray(transactionTags[description])
        ? transactionTags[description]
        : debit > 0
        ? transactionTags[description]['debit']
        : credit > 0
        ? transactionTags[description]['credit']
        : [];

      return {
        ...previous,
        [compositeId]: {
          ...(previous?.[compositeId] ?? {}),
          entries: [
            ...(previous?.[compositeId]?.entries ?? []),
            {
              id,
              accountId,
              accountName,
              debit,
              credit,
              currency: 'NOK' as const
            }
          ],
          description,
          tags: [
            ...new Set([...(previous?.[compositeId]?.tags ?? []), ...tags])
          ],
          createdDate,
          updatedDate
        }
      };
    },
    {} as Record<string | number, Transaction>
  );

Object.values(transactions).filter(({ tags, entries, ...rest }) => {
  if (
    (tags.includes(Tags.INCOME) && tags.includes(Tags.EXPENSE)) ||
    entries.some(({ debit, credit }) => isNaN(debit) || isNaN(credit))
  ) {
    console.error('Bad transaction', {
      ...rest,
      entries,
      tags
    });

    return false;
  }

  return true;
});

if (processArguments.includes('-o')) {
  const outputCommandIndex = processArguments.findIndex(v => v === '-o');
  const outputPathArgument = processArguments[outputCommandIndex + 1];
  const outputPath =
    outputCommandIndex != -1 && outputPathArgument?.endsWith('.json')
      ? outputPathArgument
      : './bin/transactions.json';

  writeFile(
    resolve(outputPath),
    JSON.stringify(
      Object.values(transactions).sort(
        ({ entries: [a] }, { entries: [b] }) =>
          Number(a.id ?? 0) - Number(b.id ?? 0)
      ),
      null,
      4
    ),
    'utf8',
    console.error
  );
}

if (!processArguments.includes('--dry')) {
  readLine.question('Are you sure you want to proceed? Y/N  ', async answer => {
    if (answer.toLowerCase() === 'y') {
      console.log('Proceeding with migration...');

      try {
        const prisma = new PrismaClient();

        const createdTransactions = await prisma.$transaction(
          Object.values(transactions)
            .sort(
              ({ entries: [a] }, { entries: [b] }) =>
                Number(a.id ?? 0) - Number(b.id ?? 0)
            )
            .map(({ description, tags, entries, createdDate, updatedDate }) =>
              prisma.transaction.create({
                data: {
                  userId: 'az',
                  description,
                  tags,
                  createdAt: createdDate,
                  updatedAt: updatedDate,
                  entries: {
                    createMany: {
                      data: entries.map(
                        ({
                          accountId: account,
                          debit = 0,
                          credit = 0,
                          currency
                        }) => ({
                          account,
                          debit,
                          credit,
                          currency
                        })
                      )
                    }
                  }
                }
              })
            )
        );

        console.log(
          `${createdTransactions.length} transactions were successfully created`
        );
      } catch (e) {
        console.error(e);
      }
    } else {
      console.log('Aborting migration');
    }

    readLine.close();
  });
} else {
  readLine.close();
}
