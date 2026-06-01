import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { Prisma, TransactionType } from '@prisma/client';

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { type } = req.query;

    const where: Prisma.CategoryWhereInput = { userId };
    if (type && (type === 'INCOME' || type === 'EXPENSE')) {
      where.type = type as TransactionType;
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(categories);
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { name, type, icon } = req.body;

    const existing = await prisma.category.findFirst({
      where: { name: name as string, type, userId },
    });

    if (existing) {
      throw new BadRequestError('Category already exists');
    }

    const category = await prisma.category.create({
      data: {
        name,
        type,
        icon,
        userId,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { name, type, icon } = req.body;

    const category = await prisma.category.findFirst({
      where: { id: id as string, userId },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const updated = await prisma.category.update({
      where: { id: id as string },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(icon !== undefined && { icon }),
      },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const category = await prisma.category.findFirst({
      where: { id: id as string, userId },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const transactionCount = await prisma.transaction.count({
      where: { categoryId: id as string },
    });

    if (transactionCount > 0) {
      throw new BadRequestError(
        `Cannot delete category with ${transactionCount} transaction(s). Move or delete them first.`
      );
    }

    await prisma.category.delete({ where: { id: id as string } });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
}
