"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/dashboard', analytics_controller_1.getDashboard);
router.get('/monthly', analytics_controller_1.getMonthlyReport);
router.get('/insights', analytics_controller_1.getInsights);
router.get('/summary', analytics_controller_1.getSummary);
router.get('/budget-status', analytics_controller_1.getBudgetStatus);
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map