"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../validators/schemas");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', category_controller_1.getCategories);
router.post('/', (0, validate_1.validate)(schemas_1.categorySchema), category_controller_1.createCategory);
router.put('/:id', (0, validate_1.validate)(schemas_1.categorySchema), category_controller_1.updateCategory);
router.delete('/:id', category_controller_1.deleteCategory);
exports.default = router;
//# sourceMappingURL=category.routes.js.map