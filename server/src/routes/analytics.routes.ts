import { Router } from 'express';
import { getDashboard, getMonthlyReport, getInsights, getSummary, getBudgetStatus } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboard);
router.get('/monthly', getMonthlyReport);
router.get('/insights', getInsights);
router.get('/summary', getSummary);
router.get('/budget-status', getBudgetStatus);

export default router;
