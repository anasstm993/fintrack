import { PrismaClient } from '@prisma/client';
import { defaultCategories } from '../src/constants/categories';

const prisma = new PrismaClient();

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
