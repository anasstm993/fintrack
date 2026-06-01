import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { Prisma } from '@prisma/client';

export async function getBudgets(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;

    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: {
        category: { select: { id: true, name: true, type: true, icon: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(budgets);
  } catch (error) {
    next(error);
  }
}

export async function setBudget(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { categoryId, amount } = req.body;

    if (!categoryId || !amount || amount <= 0) {
      throw new BadRequestError('categoryId and positive amount are required');
    }

    // Verify the category belongs to this user and is an EXPENSE type
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId, type: 'EXPENSE' },
    });

    if (!category) {
      throw new NotFoundError('Expense category not found');
    }

    const budget = await prisma.budget.upsert({
      where: { categoryId_userId: { categoryId, userId } },
      update: { amount: new Prisma.Decimal(amount) },
      create: {
        categoryId,
        userId,
        amount: new Prisma.Decimal(amount),
      },
      include: {
        category: { select: { id: true, name: true, type: true, icon: true } },
      },
    });

    res.json(budget);
  } catch (error) {
    next(error);
  }
}

export async function deleteBudget(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const existing = await prisma.budget.findFirst({
      where: { id: id as string, userId },
    });

    if (!existing) {
      throw new NotFoundError('Budget not found');
    }

    await prisma.budget.delete({ where: { id: id as string } });

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    next(error);
  }
}
