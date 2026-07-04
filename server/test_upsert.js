const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return console.log('no user');
    const cat = { name: 'Salary2', type: 'INCOME', userId: user.id };
    await prisma.category.upsert({
      where: { name_type_userId: cat },
      update: {},
      create: cat,
    });
    console.log('success');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

test();
