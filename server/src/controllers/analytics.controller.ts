import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;

    const [incomeResult, expenseResult, recentTransactions, categoryBreakdown] = await Promise.all([
      prisma.transaction.aggregate({
        where: { userId, type: 'INCOME' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { userId, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
      prisma.transaction.findMany({
        where: { userId },
        include: {
          category: { select: { id: true, name: true, type: true, icon: true } },
        },
        orderBy: { date: 'desc' },
        take: 10,
      }),
      prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { userId, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = Number(incomeResult._sum.amount || 0);
    const totalExpenses = Number(expenseResult._sum.amount || 0);
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    const categoryIds = categoryBreakdown.map((c) => c.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    const expenseByCategory = categoryBreakdown.map((c) => ({
      categoryId: c.categoryId,
      categoryName: categoryMap.get(c.categoryId) || 'Unknown',
      amount: Number(c._sum.amount || 0),
      percentage: totalExpenses > 0 ? (Number(c._sum.amount || 0) / totalExpenses) * 100 : 0,
    }));

    // Monthly data for charts (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: sixMonthsAgo },
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
      orderBy: { date: 'asc' },
    });

    const monthlyData: Record<string, { income: number; expense: number }> = {};
    monthlyTransactions.forEach((t) => {
      const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[key]) {
        monthlyData[key] = { income: 0, expense: 0 };
      }
      if (t.type === 'INCOME') {
        monthlyData[key].income += Number(t.amount);
      } else {
        monthlyData[key].expense += Number(t.amount);
      }
    });

    const monthlyChart = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
      }));

    res.json({
      totalIncome,
      totalExpenses,
      balance,
      savingsRate: Math.round(savingsRate * 100) / 100,
      recentTransactions,
      expenseByCategory,
      monthlyChart,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMonthlyReport(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { year, month } = req.query;

    const targetYear = year ? parseInt(year as string) : new Date().getFullYear();
    const targetMonth = month ? parseInt(month as string) - 1 : new Date().getMonth();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const [incomeResult, expenseResult, categoryBreakdown, dailyTransactions] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'INCOME',
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EXPENSE',
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          userId,
          type: 'EXPENSE',
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
        },
        select: {
          amount: true,
          type: true,
          date: true,
        },
        orderBy: { date: 'asc' },
      }),
    ]);

    const totalIncome = Number(incomeResult._sum.amount || 0);
    const totalExpenses = Number(expenseResult._sum.amount || 0);
    const netSavings = totalIncome - totalExpenses;

    const categoryIds = categoryBreakdown.map((c) => c.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

    const expenseByCategory = categoryBreakdown
      .map((c) => ({
        categoryId: c.categoryId,
        categoryName: categoryMap.get(c.categoryId) || 'Unknown',
        amount: Number(c._sum.amount || 0),
        percentage: totalExpenses > 0 ? (Number(c._sum.amount || 0) / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Daily spending data for line chart
    const dailyData: Record<string, { income: number; expense: number }> = {};
    dailyTransactions.forEach((t) => {
      const key = t.date.toISOString().split('T')[0];
      if (!dailyData[key]) {
        dailyData[key] = { income: 0, expense: 0 };
      }
      if (t.type === 'INCOME') {
        dailyData[key].income += Number(t.amount);
      } else {
        dailyData[key].expense += Number(t.amount);
      }
    });

    const dailyChart = Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        income: data.income,
        expense: data.expense,
      }));

    res.json({
      year: targetYear,
      month: targetMonth + 1,
      totalIncome,
      totalExpenses,
      netSavings,
      expenseByCategory,
      dailyChart,
    });
  } catch (error) {
    next(error);
  }
}
