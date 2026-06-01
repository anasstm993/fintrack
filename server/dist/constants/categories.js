"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultCategories = void 0;
const client_1 = require("@prisma/client");
/** Default categories seeded for every new user on registration. */
exports.defaultCategories = [
    { name: 'Salary', type: client_1.TransactionType.INCOME },
    { name: 'Freelance', type: client_1.TransactionType.INCOME },
    { name: 'Investments', type: client_1.TransactionType.INCOME },
    { name: 'Food', type: client_1.TransactionType.EXPENSE },
    { name: 'Transport', type: client_1.TransactionType.EXPENSE },
    { name: 'Shopping', type: client_1.TransactionType.EXPENSE },
    { name: 'Bills', type: client_1.TransactionType.EXPENSE },
    { name: 'Healthcare', type: client_1.TransactionType.EXPENSE },
    { name: 'Entertainment', type: client_1.TransactionType.EXPENSE },
    { name: 'Education', type: client_1.TransactionType.EXPENSE },
    { name: 'Other', type: client_1.TransactionType.EXPENSE },
];
//# sourceMappingURL=categories.js.map