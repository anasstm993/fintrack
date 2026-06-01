"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transaction_controller_1 = require("../controllers/transaction.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../validators/schemas");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', transaction_controller_1.getTransactions);
router.get('/export', transaction_controller_1.exportTransactions);
router.get('/:id', transaction_controller_1.getTransaction);
router.post('/', (0, validate_1.validate)(schemas_1.transactionSchema), transaction_controller_1.createTransaction);
router.put('/:id', (0, validate_1.validate)(schemas_1.transactionSchema), transaction_controller_1.updateTransaction);
router.delete('/:id', transaction_controller_1.deleteTransaction);
exports.default = router;
//# sourceMappingURL=transaction.routes.js.map