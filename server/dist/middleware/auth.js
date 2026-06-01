"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../utils/errors");
const prisma_1 = __importDefault(require("../utils/prisma"));
function authenticate(req, _res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_1.UnauthorizedError('Access token required');
        }
        const token = authHeader.split(' ')[1];
        const payload = (0, jwt_1.verifyAccessToken)(token);
        // Verify user still exists in DB (handles database resets)
        prisma_1.default.user.findUnique({ where: { id: payload.userId } }).then((user) => {
            if (!user) {
                return next(new errors_1.UnauthorizedError('User no longer exists. Please register again.'));
            }
            req.user = payload;
            next();
        }).catch((e) => {
            console.error('Database error in auth:', e);
            next(new errors_1.UnauthorizedError('Authentication failed'));
        });
    }
    catch (error) {
        console.error('JWT error:', error);
        next(new errors_1.UnauthorizedError('Invalid or expired access token'));
    }
}
//# sourceMappingURL=auth.js.map