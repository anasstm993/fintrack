"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const budget_controller_1 = require("../controllers/budget.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', budget_controller_1.getBudgets);
router.post('/', budget_controller_1.setBudget);
router.delete('/:id', budget_controller_1.deleteBudget);
exports.default = router;
//# sourceMappingURL=budget.routes.js.map