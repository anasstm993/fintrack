"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = getCategories;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
const prisma_1 = __importDefault(require("../utils/prisma"));
const errors_1 = require("../utils/errors");
async function getCategories(req, res, next) {
    try {
        const userId = req.user.userId;
        const { type } = req.query;
        const where = { userId };
        if (type && (type === 'INCOME' || type === 'EXPENSE')) {
            where.type = type;
        }
        const categories = await prisma_1.default.category.findMany({
            where,
            include: {
                _count: {
                    select: { transactions: true },
                },
            },
            orderBy: { name: 'asc' },
        });
        res.json(categories);
    }
    catch (error) {
        next(error);
    }
}
async function createCategory(req, res, next) {
    try {
        const userId = req.user.userId;
        const { name, type, icon } = req.body;
        const existing = await prisma_1.default.category.findFirst({
            where: { name: name, type, userId },
        });
        if (existing) {
            throw new errors_1.BadRequestError('Category already exists');
        }
        const category = await prisma_1.default.category.create({
            data: {
                name,
                type,
                icon,
                userId,
            },
        });
        res.status(201).json(category);
    }
    catch (error) {
        next(error);
    }
}
async function updateCategory(req, res, next) {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const { name, type, icon } = req.body;
        const category = await prisma_1.default.category.findFirst({
            where: { id: id, userId },
        });
        if (!category) {
            throw new errors_1.NotFoundError('Category not found');
        }
        const updated = await prisma_1.default.category.update({
            where: { id: id },
            data: {
                ...(name && { name }),
                ...(type && { type }),
                ...(icon !== undefined && { icon }),
            },
        });
        res.json(updated);
    }
    catch (error) {
        next(error);
    }
}
async function deleteCategory(req, res, next) {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const category = await prisma_1.default.category.findFirst({
            where: { id: id, userId },
        });
        if (!category) {
            throw new errors_1.NotFoundError('Category not found');
        }
        const transactionCount = await prisma_1.default.transaction.count({
            where: { categoryId: id },
        });
        if (transactionCount > 0) {
            throw new errors_1.BadRequestError(`Cannot delete category with ${transactionCount} transaction(s). Move or delete them first.`);
        }
        await prisma_1.default.category.delete({ where: { id: id } });
        res.json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=category.controller.js.map