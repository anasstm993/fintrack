import { Router } from 'express';
import { getBudgets, setBudget, deleteBudget } from '../controllers/budget.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getBudgets);
router.post('/', setBudget);
router.delete('/:id', deleteBudget);

export default router;
