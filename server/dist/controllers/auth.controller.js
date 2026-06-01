"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
const prisma_1 = __importDefault(require("../utils/prisma"));
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../utils/errors");
const categories_1 = require("../constants/categories");
const crypto_1 = __importDefault(require("crypto"));
async function seedCategoriesForUser(userId) {
    const data = categories_1.defaultCategories.map((cat) => ({ ...cat, userId }));
    await prisma_1.default.$transaction(data.map((cat) => prisma_1.default.category.upsert({
        where: {
            name_type_userId: { name: cat.name, type: cat.type, userId: cat.userId },
        },
        update: {},
        create: cat,
    })));
}
async function register(req, res, next) {
    try {
        const { name, email, password } = req.body;
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new errors_1.ConflictError('Email already registered');
        }
        const hashedPassword = await (0, password_1.hashPassword)(password);
        const user = await prisma_1.default.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
        await seedCategoriesForUser(user.id);
        const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id, email: user.email });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ userId: user.id, email: user.email });
        const hashedRefreshToken = crypto_1.default.createHash('sha256').update(refreshToken).digest('hex');
        await prisma_1.default.refreshToken.create({
            data: {
                token: hashedRefreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        res.status(201).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                createdAt: user.createdAt,
            },
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        next(error);
    }
}
async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            throw new errors_1.UnauthorizedError('Invalid email or password');
        }
        const isValid = await (0, password_1.comparePassword)(password, user.password);
        if (!isValid) {
            throw new errors_1.UnauthorizedError('Invalid email or password');
        }
        const accessToken = (0, jwt_1.generateAccessToken)({ userId: user.id, email: user.email });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ userId: user.id, email: user.email });
        const hashedRefreshToken = crypto_1.default.createHash('sha256').update(refreshToken).digest('hex');
        await prisma_1.default.refreshToken.create({
            data: {
                token: hashedRefreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                createdAt: user.createdAt,
            },
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        next(error);
    }
}
async function refresh(req, res, next) {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new errors_1.BadRequestError('Refresh token required');
        }
        let payload;
        try {
            payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        }
        catch {
            throw new errors_1.UnauthorizedError('Invalid refresh token');
        }
        const hashedToken = crypto_1.default.createHash('sha256').update(refreshToken).digest('hex');
        const storedToken = await prisma_1.default.refreshToken.findUnique({
            where: { token: hashedToken },
        });
        if (!storedToken || storedToken.expiresAt < new Date()) {
            if (storedToken) {
                await prisma_1.default.refreshToken.delete({ where: { id: storedToken.id } });
            }
            throw new errors_1.UnauthorizedError('Refresh token expired or invalid');
        }
        await prisma_1.default.refreshToken.delete({ where: { id: storedToken.id } });
        const newAccessToken = (0, jwt_1.generateAccessToken)({ userId: payload.userId, email: payload.email });
        const newRefreshToken = (0, jwt_1.generateRefreshToken)({ userId: payload.userId, email: payload.email });
        const newHashedToken = crypto_1.default.createHash('sha256').update(newRefreshToken).digest('hex');
        await prisma_1.default.refreshToken.create({
            data: {
                token: newHashedToken,
                userId: payload.userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    }
    catch (error) {
        next(error);
    }
}
async function logout(req, res, next) {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            const hashedToken = crypto_1.default.createHash('sha256').update(refreshToken).digest('hex');
            await prisma_1.default.refreshToken.deleteMany({ where: { token: hashedToken } });
        }
        res.json({ message: 'Logged out successfully' });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=auth.controller.js.map