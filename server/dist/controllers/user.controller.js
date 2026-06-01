"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = getMe;
exports.updateMe = updateMe;
exports.changePassword = changePassword;
exports.updateAvatar = updateAvatar;
const prisma_1 = __importDefault(require("../utils/prisma"));
const password_1 = require("../utils/password");
const errors_1 = require("../utils/errors");
async function getMe(req, res, next) {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        res.json(user);
    }
    catch (error) {
        next(error);
    }
}
async function updateMe(req, res, next) {
    try {
        const { name, email } = req.body;
        const userId = req.user.userId;
        if (email) {
            const existing = await prisma_1.default.user.findFirst({
                where: { email, NOT: { id: userId } },
            });
            if (existing) {
                throw new errors_1.BadRequestError('Email already in use');
            }
        }
        const user = await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(email && { email }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        res.json(user);
    }
    catch (error) {
        next(error);
    }
}
async function changePassword(req, res, next) {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;
        const user = await prisma_1.default.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        const isValid = await (0, password_1.comparePassword)(currentPassword, user.password);
        if (!isValid) {
            throw new errors_1.UnauthorizedError('Current password is incorrect');
        }
        const hashedPassword = await (0, password_1.hashPassword)(newPassword);
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        next(error);
    }
}
async function updateAvatar(req, res, next) {
    try {
        const userId = req.user.userId;
        if (!req.file) {
            throw new errors_1.BadRequestError('No file uploaded');
        }
        const avatarPath = `/uploads/${req.file.filename}`;
        const user = await prisma_1.default.user.update({
            where: { id: userId },
            data: { avatar: avatarPath },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        res.json(user);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=user.controller.js.map