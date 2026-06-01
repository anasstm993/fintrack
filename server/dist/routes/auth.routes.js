"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../validators/schemas");
const router = (0, express_1.Router)();
router.post('/register', (0, validate_1.validate)(schemas_1.registerSchema), auth_controller_1.register);
router.post('/login', (0, validate_1.validate)(schemas_1.loginSchema), auth_controller_1.login);
router.post('/refresh', (0, validate_1.validate)(schemas_1.refreshSchema), auth_controller_1.refresh);
router.post('/logout', auth_controller_1.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map