"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../validators/schemas");
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed'));
        }
    },
});
router.use(auth_1.authenticate);
router.get('/me', user_controller_1.getMe);
router.put('/me', (0, validate_1.validate)(schemas_1.updateProfileSchema), user_controller_1.updateMe);
router.put('/password', (0, validate_1.validate)(schemas_1.changePasswordSchema), user_controller_1.changePassword);
router.put('/avatar', upload.single('avatar'), user_controller_1.updateAvatar);
exports.default = router;
//# sourceMappingURL=user.routes.js.map