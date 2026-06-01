"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactions = getTransactions;
exports.getTransaction = getTransaction;
exports.createTransaction = createTransaction;
exports.updateTransaction = updateTransaction;
exports.deleteTransaction = deleteTransaction;
exports.exportTransactions = exportTransactions;
const prisma_1 = __importDefault(require("../utils/prisma"));
const errors_1 = require("../utils/errors");
const client_1 = require("@prisma/client");
/** Builds a Prisma `where` clause for transaction queries from request query params. */
function buildTransactionWhere(userId, query) {
    const { search, type, categoryId, startDate, endDate } = query;
    const where = { userId };
    if (search) {
        where.OR = [
            { title: { contains: search } },
            { description: { contains: search } },
        ];
    }
    if (type && (type === 'INCOME' || type === 'EXPENSE')) {
        where.type = type;
    }
    if (categoryId) {
        where.categoryId = categoryId;
    }
    if (startDate || endDate) {
        where.date = {};
        if (startDate)
            where.date.gte = new Date(startDate);
        if (endDate)
            where.date.lte = new Date(endDate);
    }
    return where;
}
async function getTransactions(req, res, next) {
    try {
        const userId = req.user.userId;
        const { page = '1', limit = '10', sortBy = 'date', sortOrder = 'desc', } = req.query;
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;
        const where = buildTransactionWhere(userId, req.query);
        const orderBy = {};
        const validSortFields = ['date', 'amount', 'title', 'createdAt'];
        const field = validSortFields.includes(sortBy) ? sortBy : 'date';
        orderBy[field] =
            sortOrder === 'asc' ? 'asc' : 'desc';
        const [transactions, total] = await Promise.all([
            prisma_1.default.transaction.findMany({
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
            prisma_1.default.transaction.count({ where }),
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
    }
    catch (error) {
        next(error);
    }
}
async function getTransaction(req, res, next) {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const transaction = await prisma_1.default.transaction.findFirst({
            where: { id: id, userId },
            include: {
                category: {
                    select: { id: true, name: true, type: true, icon: true },
                },
            },
        });
        if (!transaction) {
            throw new errors_1.NotFoundError('Transaction not found');
        }
        res.json(transaction);
    }
    catch (error) {
        next(error);
    }
}
async function createTransaction(req, res, next) {
    try {
        const userId = req.user.userId;
        const { title, description, amount, type, categoryId, date } = req.body;
        const transaction = await prisma_1.default.transaction.create({
            data: {
                title,
                description,
                amount: new client_1.Prisma.Decimal(amount),
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
    }
    catch (error) {
        next(error);
    }
}
async function updateTransaction(req, res, next) {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const { title, description, amount, type, categoryId, date } = req.body;
        const existing = await prisma_1.default.transaction.findFirst({
            where: { id: id, userId },
        });
        if (!existing) {
            throw new errors_1.NotFoundError('Transaction not found');
        }
        const transaction = await prisma_1.default.transaction.update({
            where: { id: id },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(amount !== undefined && { amount: new client_1.Prisma.Decimal(amount) }),
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
    }
    catch (error) {
        next(error);
    }
}
async function deleteTransaction(req, res, next) {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const existing = await prisma_1.default.transaction.findFirst({
            where: { id: id, userId },
        });
        if (!existing) {
            throw new errors_1.NotFoundError('Transaction not found');
        }
        await prisma_1.default.transaction.delete({ where: { id: id } });
        res.json({ message: 'Transaction deleted successfully' });
    }
    catch (error) {
        next(error);
    }
}
async function exportTransactions(req, res, next) {
    try {
        const userId = req.user.userId;
        const where = buildTransactionWhere(userId, req.query);
        const transactions = await prisma_1.default.transaction.findMany({
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
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=transaction.controller.js.map