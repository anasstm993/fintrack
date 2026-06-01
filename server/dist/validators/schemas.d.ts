import { z } from 'zod';
export declare const registerSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}, {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}>, {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}, {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const refreshSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refreshToken: string;
}, {
    refreshToken: string;
}>;
export declare const changePasswordSchema: z.ZodEffects<z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
}, {
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
}>, {
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
}, {
    confirmPassword: string;
    currentPassword: string;
    newPassword: string;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    email?: string | undefined;
}, {
    name?: string | undefined;
    email?: string | undefined;
}>;
export declare const categorySchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["INCOME", "EXPENSE"]>;
    icon: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "INCOME" | "EXPENSE";
    icon?: string | undefined;
}, {
    name: string;
    type: "INCOME" | "EXPENSE";
    icon?: string | undefined;
}>;
export declare const transactionSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    amount: z.ZodNumber;
    type: z.ZodEnum<["INCOME", "EXPENSE"]>;
    categoryId: z.ZodString;
    date: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
}, "strip", z.ZodTypeAny, {
    type: "INCOME" | "EXPENSE";
    title: string;
    amount: number;
    categoryId: string;
    date?: string | Date | undefined;
    description?: string | undefined;
}, {
    type: "INCOME" | "EXPENSE";
    title: string;
    amount: number;
    categoryId: string;
    date?: string | Date | undefined;
    description?: string | undefined;
}>;
//# sourceMappingURL=schemas.d.ts.map