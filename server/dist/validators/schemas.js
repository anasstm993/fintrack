"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionSchema = exports.categorySchema = exports.updateProfileSchema = exports.changePasswordSchema = exports.refreshSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: zod_1.z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
});
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1, 'Current password is required'),
    newPassword: zod_1.z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: zod_1.z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    email: zod_1.z.string().email('Invalid email address').optional(),
});
exports.categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Category name is required').max(50),
    type: zod_1.z.enum(['INCOME', 'EXPENSE']),
    icon: zod_1.z.string().optional(),
});
exports.transactionSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').max(200),
    description: zod_1.z.string().max(500).optional(),
    amount: zod_1.z.number().positive('Amount must be positive'),
    type: zod_1.z.enum(['INCOME', 'EXPENSE']),
    categoryId: zod_1.z.string().min(1, 'Category is required'),
    date: zod_1.z.string().or(zod_1.z.date()).optional(),
});
//# sourceMappingURL=schemas.js.map