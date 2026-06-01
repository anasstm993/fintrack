"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBudgets = getBudgets;
exports.setBudget = setBudget;
exports.deleteBudget = deleteBudget;
const prisma_1 = __importDefault(require("../utils/prisma"));
const errors_1 = require("../utils/errors");
const client_1 = require("@prisma/client");
async function getBudgets(req, res, next) {
    try {
        const userId = req.user.userId;
        const budgets = await prisma_1.default.budget.findMany({
            where: { userId },
            include: {
                category: { select: { id: true, name: true, type: true, icon: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(budgets);
    }
    catch (error) {
        next(error);
    }
}
async function setBudget(req, res, next) {
    try {
        const userId = req.user.userId;
        const { categoryId, amount } = req.body;
        if (!categoryId || !amount || amount <= 0) {
            throw new errors_1.BadRequestError('categoryId and positive amount are required');
        }
        // Verify the category belongs to this user and is an EXPENSE type
        const category = await prisma_1.default.category.findFirst({
            where: { id: categoryId, userId, type: 'EXPENSE' },
        });
        if (!category) {
            throw new errors_1.NotFoundError('Expense category not found');
        }
        const budget = await prisma_1.default.budget.upsert({
            where: { categoryId_userId: { categoryId, userId } },
            update: { amount: new client_1.Prisma.Decimal(amount) },
            create: {
                categoryId,
                userId,
                amount: new client_1.Prisma.Decimal(amount),
            },
            include: {
                category: { select: { id: true, name: true, type: true, icon: true } },
            },
        });
        res.json(budget);
    }
    catch (error) {
        next(error);
    }
}
async function deleteBudget(req, res, next) {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const existing = await prisma_1.default.budget.findFirst({
            where: { id: id, userId },
        });
        if (!existing) {
            throw new errors_1.NotFoundError('Budget not found');
        }
        await prisma_1.default.budget.delete({ where: { id: id } });
        res.json({ message: 'Budget deleted successfully' });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=budget.controller.js.map