"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboard = getDashboard;
exports.getMonthlyReport = getMonthlyReport;
exports.getInsights = getInsights;
exports.getSummary = getSummary;
exports.getBudgetStatus = getBudgetStatus;
const prisma_1 = __importDefault(require("../utils/prisma"));
async function getDashboard(req, res, next) {
    try {
        const userId = req.user.userId;
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        const [allTimeIncome, allTimeExpense, monthIncome, monthExpense, recentTransactions, categoryBreakdown] = await Promise.all([
            prisma_1.default.transaction.aggregate({
                where: { userId, type: 'INCOME' },
                _sum: { amount: true },
            }),
            prisma_1.default.transaction.aggregate({
                where: { userId, type: 'EXPENSE' },
                _sum: { amount: true },
            }),
            prisma_1.default.transaction.aggregate({
                where: { userId, type: 'INCOME', date: { gte: monthStart, lte: monthEnd } },
                _sum: { amount: true },
            }),
            prisma_1.default.transaction.aggregate({
                where: { userId, type: 'EXPENSE', date: { gte: monthStart, lte: monthEnd } },
                _sum: { amount: true },
            }),
            prisma_1.default.transaction.findMany({
                where: { userId },
                include: {
                    category: { select: { id: true, name: true, type: true, icon: true } },
                },
                orderBy: { date: 'desc' },
                take: 10,
            }),
            prisma_1.default.transaction.groupBy({
                by: ['categoryId'],
                where: { userId, type: 'EXPENSE', date: { gte: monthStart, lte: monthEnd } },
                _sum: { amount: true },
            }),
        ]);
        const totalIncome = Number(monthIncome._sum.amount || 0);
        const totalExpenses = Number(monthExpense._sum.amount || 0);
        const balance = Number(allTimeIncome._sum.amount || 0) - Number(allTimeExpense._sum.amount || 0);
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
        const categoryIds = categoryBreakdown.map((c) => c.categoryId);
        const categories = await prisma_1.default.category.findMany({
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
        const monthlyTransactions = await prisma_1.default.transaction.findMany({
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
        const monthlyData = {};
        monthlyTransactions.forEach((t) => {
            const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyData[key]) {
                monthlyData[key] = { income: 0, expense: 0 };
            }
            if (t.type === 'INCOME') {
                monthlyData[key].income += Number(t.amount);
            }
            else {
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
    }
    catch (error) {
        next(error);
    }
}
async function getMonthlyReport(req, res, next) {
    try {
        const userId = req.user.userId;
        const { year, month } = req.query;
        const targetYear = year ? parseInt(year) : new Date().getFullYear();
        const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
        const startDate = new Date(targetYear, targetMonth, 1);
        const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
        const [incomeResult, expenseResult, categoryBreakdown, dailyTransactions] = await Promise.all([
            prisma_1.default.transaction.aggregate({
                where: {
                    userId,
                    type: 'INCOME',
                    date: { gte: startDate, lte: endDate },
                },
                _sum: { amount: true },
            }),
            prisma_1.default.transaction.aggregate({
                where: {
                    userId,
                    type: 'EXPENSE',
                    date: { gte: startDate, lte: endDate },
                },
                _sum: { amount: true },
            }),
            prisma_1.default.transaction.groupBy({
                by: ['categoryId'],
                where: {
                    userId,
                    type: 'EXPENSE',
                    date: { gte: startDate, lte: endDate },
                },
                _sum: { amount: true },
            }),
            prisma_1.default.transaction.findMany({
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
        const categories = await prisma_1.default.category.findMany({
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
        const dailyData = {};
        dailyTransactions.forEach((t) => {
            const key = t.date.toISOString().split('T')[0];
            if (!dailyData[key]) {
                dailyData[key] = { income: 0, expense: 0 };
            }
            if (t.type === 'INCOME') {
                dailyData[key].income += Number(t.amount);
            }
            else {
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
    }
    catch (error) {
        next(error);
    }
}
async function getInsights(req, res, next) {
    try {
        const userId = req.user.userId;
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        const [thisMonthIncome, thisMonthExpenses, lastMonthIncome, lastMonthExpenses, topCategories] = await Promise.all([
            prisma_1.default.transaction.aggregate({ where: { userId, type: 'INCOME', date: { gte: thisMonthStart, lte: thisMonthEnd } }, _sum: { amount: true } }),
            prisma_1.default.transaction.aggregate({ where: { userId, type: 'EXPENSE', date: { gte: thisMonthStart, lte: thisMonthEnd } }, _sum: { amount: true } }),
            prisma_1.default.transaction.aggregate({ where: { userId, type: 'INCOME', date: { gte: lastMonthStart, lte: lastMonthEnd } }, _sum: { amount: true } }),
            prisma_1.default.transaction.aggregate({ where: { userId, type: 'EXPENSE', date: { gte: lastMonthStart, lte: lastMonthEnd } }, _sum: { amount: true } }),
            prisma_1.default.transaction.groupBy({
                by: ['categoryId'],
                where: { userId, type: 'EXPENSE', date: { gte: thisMonthStart, lte: thisMonthEnd } },
                _sum: { amount: true },
                orderBy: { _sum: { amount: 'desc' } },
                take: 5,
            }),
        ]);
        const currentIncome = Number(thisMonthIncome._sum.amount || 0);
        const currentExpenses = Number(thisMonthExpenses._sum.amount || 0);
        const prevIncome = Number(lastMonthIncome._sum.amount || 0);
        const prevExpenses = Number(lastMonthExpenses._sum.amount || 0);
        const currentSavingsRate = currentIncome > 0 ? ((currentIncome - currentExpenses) / currentIncome) * 100 : 0;
        const prevSavingsRate = prevIncome > 0 ? ((prevIncome - prevExpenses) / prevIncome) * 100 : 0;
        const savingsRateChange = currentSavingsRate - prevSavingsRate;
        // Get top category name
        let topCategoryName = 'Unknown';
        let topCategoryAmount = 0;
        if (topCategories.length > 0) {
            const cat = await prisma_1.default.category.findUnique({ where: { id: topCategories[0].categoryId }, select: { name: true } });
            topCategoryName = cat?.name || 'Unknown';
            topCategoryAmount = Number(topCategories[0]._sum.amount || 0);
        }
        const insights = [];
        // Get budgets and calculate their statuses
        const budgets = await prisma_1.default.budget.findMany({
            where: { userId },
            include: { category: { select: { id: true, name: true } } },
        });
        if (budgets.length > 0) {
            const categoryIds = budgets.map(b => b.categoryId);
            const spending = await prisma_1.default.transaction.groupBy({
                by: ['categoryId'],
                where: {
                    userId,
                    type: 'EXPENSE',
                    categoryId: { in: categoryIds },
                    date: { gte: thisMonthStart, lte: thisMonthEnd },
                },
                _sum: { amount: true },
            });
            const spendingMap = new Map(spending.map(s => [s.categoryId, Number(s._sum.amount || 0)]));
            budgets.forEach(budget => {
                const budgetAmount = Number(budget.amount);
                const spent = spendingMap.get(budget.categoryId) || 0;
                const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
                if (percentage >= 100) {
                    insights.push({
                        type: 'danger',
                        key: 'budget_danger',
                        message: `You have exceeded your budget for ${budget.category.name}.`,
                        data: { categoryName: budget.category.name },
                    });
                }
                else if (percentage >= 80) {
                    insights.push({
                        type: 'warning',
                        key: 'budget_warning',
                        message: `You are close to exceeding your budget for ${budget.category.name}.`,
                        data: { categoryName: budget.category.name },
                    });
                }
            });
        }
        res.json({
            insights,
            data: {
                currentIncome,
                currentExpenses,
                prevIncome,
                prevExpenses,
                currentSavingsRate: Math.round(currentSavingsRate * 100) / 100,
                prevSavingsRate: Math.round(prevSavingsRate * 100) / 100,
                savingsRateChange: Math.round(savingsRateChange * 100) / 100,
                topCategoryName,
                topCategoryAmount,
                expenseChange: prevExpenses > 0 ? Math.round(((currentExpenses - prevExpenses) / prevExpenses) * 10000) / 100 : 0,
            },
        });
    }
    catch (error) {
        next(error);
    }
}
async function getSummary(req, res, next) {
    try {
        const userId = req.user.userId;
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        const [allTimeIncome, allTimeExpenses, thisMonthIncome, thisMonthExpenses, lastMonthIncome, lastMonthExpenses, transactionCount] = await Promise.all([
            prisma_1.default.transaction.aggregate({ where: { userId, type: 'INCOME' }, _sum: { amount: true } }),
            prisma_1.default.transaction.aggregate({ where: { userId, type: 'EXPENSE' }, _sum: { amount: true } }),
            prisma_1.default.transaction.aggregate({ where: { userId, type: 'INCOME', date: { gte: thisMonthStart, lte: thisMonthEnd } }, _sum: { amount: true } }),
            prisma_1.default.transaction.aggregate({ where: { userId, type: 'EXPENSE', date: { gte: thisMonthStart, lte: thisMonthEnd } }, _sum: { amount: true } }),
            prisma_1.default.transaction.aggregate({ where: { userId, type: 'INCOME', date: { gte: lastMonthStart, lte: lastMonthEnd } }, _sum: { amount: true } }),
            prisma_1.default.transaction.aggregate({ where: { userId, type: 'EXPENSE', date: { gte: lastMonthStart, lte: lastMonthEnd } }, _sum: { amount: true } }),
            prisma_1.default.transaction.count({ where: { userId } }),
        ]);
        const totalIncome = Number(allTimeIncome._sum.amount || 0);
        const totalExpenses = Number(allTimeExpenses._sum.amount || 0);
        const currentMonthIncome = Number(thisMonthIncome._sum.amount || 0);
        const currentMonthExpenses = Number(thisMonthExpenses._sum.amount || 0);
        const previousMonthIncome = Number(lastMonthIncome._sum.amount || 0);
        const previousMonthExpenses = Number(lastMonthExpenses._sum.amount || 0);
        const incomeChange = previousMonthIncome > 0
            ? ((currentMonthIncome - previousMonthIncome) / previousMonthIncome) * 100 : 0;
        const expenseChange = previousMonthExpenses > 0
            ? ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100 : 0;
        res.json({
            allTime: { totalIncome, totalExpenses, balance: totalIncome - totalExpenses },
            thisMonth: { income: currentMonthIncome, expenses: currentMonthExpenses, balance: currentMonthIncome - currentMonthExpenses },
            lastMonth: { income: previousMonthIncome, expenses: previousMonthExpenses, balance: previousMonthIncome - previousMonthExpenses },
            changes: {
                incomeChange: Math.round(incomeChange * 100) / 100,
                expenseChange: Math.round(expenseChange * 100) / 100,
            },
            transactionCount,
        });
    }
    catch (error) {
        next(error);
    }
}
async function getBudgetStatus(req, res, next) {
    try {
        const userId = req.user.userId;
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        const budgets = await prisma_1.default.budget.findMany({
            where: { userId },
            include: { category: { select: { id: true, name: true, type: true, icon: true } } },
        });
        if (budgets.length === 0) {
            res.json([]);
            return;
        }
        const categoryIds = budgets.map(b => b.categoryId);
        const spending = await prisma_1.default.transaction.groupBy({
            by: ['categoryId'],
            where: {
                userId,
                type: 'EXPENSE',
                categoryId: { in: categoryIds },
                date: { gte: monthStart, lte: monthEnd },
            },
            _sum: { amount: true },
        });
        const spendingMap = new Map(spending.map(s => [s.categoryId, Number(s._sum.amount || 0)]));
        const budgetStatus = budgets.map(budget => {
            const budgetAmount = Number(budget.amount);
            const spent = spendingMap.get(budget.categoryId) || 0;
            const remaining = budgetAmount - spent;
            const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
            const status = percentage >= 100 ? 'exceeded' :
                percentage >= 80 ? 'danger' :
                    percentage >= 60 ? 'warning' : 'safe';
            return {
                id: budget.id,
                categoryId: budget.categoryId,
                categoryName: budget.category.name,
                budgetAmount,
                spent,
                remaining,
                percentage: Math.round(percentage * 100) / 100,
                status,
            };
        });
        budgetStatus.sort((a, b) => b.percentage - a.percentage);
        res.json(budgetStatus);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=analytics.controller.js.map