import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
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

export async function seedCategoriesForUser(userId: string) {
  const categories = defaultCategories.map((cat) => ({
    ...cat,
    userId,
  }));

  await prisma.category.createMany({
    data: categories,
    skipDuplicates: true,
  });
}

async function main() {
  console.log('Seed script ready. Categories will be created per-user on registration.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
