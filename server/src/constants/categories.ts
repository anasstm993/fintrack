import { TransactionType } from '@prisma/client';

/** Default categories seeded for every new user on registration. */
export const defaultCategories = [
  { name: 'Salary', type: TransactionType.INCOME },
  { name: 'Freelance', type: TransactionType.INCOME },
  { name: 'Investments', type: TransactionType.INCOME },
  { name: 'Food', type: TransactionType.EXPENSE },
  { name: 'Transport', type: TransactionType.EXPENSE },
  { name: 'Shopping', type: TransactionType.EXPENSE },
  { name: 'Bills', type: TransactionType.EXPENSE },
  { name: 'Healthcare', type: TransactionType.EXPENSE },
  { name: 'Entertainment', type: TransactionType.EXPENSE },
  { name: 'Education', type: TransactionType.EXPENSE },
  { name: 'Other', type: TransactionType.EXPENSE },
];
