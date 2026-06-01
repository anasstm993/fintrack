import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { NotFoundError } from '../utils/errors';
import { Prisma } from '@prisma/client';

/** Builds a Prisma `where` clause for transaction queries from request query params. */
function buildTransactionWhere(
  userId: string,
  query: Record<string, unknown>
): Prisma.TransactionWhereInput {
  const { search, type, categoryId, startDate, endDate } = query;
  const where: Prisma.TransactionWhereInput = { userId };

  if (search) {
    where.OR = [
      { title: { contains: search as string } },
      { description: { contains: search as string } },
    ];
  }

  if (type && (type === 'INCOME' || type === 'EXPENSE')) {
    where.type = type as 'INCOME' | 'EXPENSE';
  }

  if (categoryId) {
    where.categoryId = categoryId as string;
  }

  if (startDate || endDate) {
    where.date = {};
    if (startDate) where.date.gte = new Date(startDate as string);
    if (endDate) where.date.lte = new Date(endDate as string);
  }

  return where;
}

export async function getTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const {
      page = '1',
      limit = '10',
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    const where = buildTransactionWhere(userId, req.query as Record<string, unknown>);

    const orderBy: Prisma.TransactionOrderByWithRelationInput = {};
    const validSortFields = ['date', 'amount', 'title', 'createdAt'];
    const field = validSortFields.includes(sortBy as string) ? (sortBy as string) : 'date';
    orderBy[field as keyof Prisma.TransactionOrderByWithRelationInput] =
      sortOrder === 'asc' ? 'asc' : 'desc';

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, type: true, icon: true },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      data: transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: { id: id as string, userId },
      include: {
        category: {
          select: { id: true, name: true, type: true, icon: true },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundError('Transaction not found');
    }

    res.json(transaction);
  } catch (error) {
    next(error);
  }
}

export async function createTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { title, description, amount, type, categoryId, date } = req.body;

    const transaction = await prisma.transaction.create({
      data: {
        title,
        description,
        amount: new Prisma.Decimal(amount),
        type,
        categoryId,
        userId,
        date: date ? new Date(date) : new Date(),
      },
      include: {
        category: {
          select: { id: true, name: true, type: true, icon: true },
        },
      },
    });

    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
}

export async function updateTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { title, description, amount, type, categoryId, date } = req.body;

    const existing = await prisma.transaction.findFirst({
      where: { id: id as string, userId },
    });

    if (!existing) {
      throw new NotFoundError('Transaction not found');
    }

    const transaction = await prisma.transaction.update({
      where: { id: id as string },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(amount !== undefined && { amount: new Prisma.Decimal(amount) }),
        ...(type && { type }),
        ...(categoryId && { categoryId }),
        ...(date && { date: new Date(date) }),
      },
      include: {
        category: {
          select: { id: true, name: true, type: true, icon: true },
        },
      },
    });

    res.json(transaction);
  } catch (error) {
    next(error);
  }
}

export async function deleteTransaction(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const existing = await prisma.transaction.findFirst({
      where: { id: id as string, userId },
    });

    if (!existing) {
      throw new NotFoundError('Transaction not found');
    }

    await prisma.transaction.delete({ where: { id: id as string } });

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function exportTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const where = buildTransactionWhere(userId, req.query as Record<string, unknown>);

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    });

    const csvData = transactions.map((t) => ({
      Date: new Date(t.date).toLocaleDateString(),
      Title: t.title,
      Description: t.description || '',
      Category: t.category.name,
      Type: t.type,
      Amount: t.amount.toString(),
    }));

    res.json(csvData);
  } catch (error) {
    next(error);
  }
}
