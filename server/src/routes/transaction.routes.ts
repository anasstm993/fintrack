import { Router } from 'express';
import {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportTransactions,
} from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { transactionSchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.get('/', getTransactions);
router.get('/export', exportTransactions);
router.get('/:id', getTransaction);
router.post('/', validate(transactionSchema), createTransaction);
router.put('/:id', validate(transactionSchema), updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
