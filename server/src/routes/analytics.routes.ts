import { Router } from 'express';
import { getDashboard, getMonthlyReport } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboard);
router.get('/monthly', getMonthlyReport);

export default router;
