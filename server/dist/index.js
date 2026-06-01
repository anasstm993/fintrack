"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorHandler_1 = require("./middleware/errorHandler");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const transaction_routes_1 = __importDefault(require("./routes/transaction.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const budget_routes_1 = __importDefault(require("./routes/budget.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin)
            return callback(null, true);
        // Allow any localhost port in development
        if (origin.match(/^http:\/\/localhost:\d+$/))
            return callback(null, true);
        // Allow configured CLIENT_URL
        if (origin === process.env.CLIENT_URL)
            return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/auth', limiter);
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Static files for avatars
app.use('/uploads', express_1.default.static('uploads'));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/categories', category_routes_1.default);
app.use('/api/transactions', transaction_routes_1.default);
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/budgets', budget_routes_1.default);
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Error handler
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map