import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/category.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { categorySchema } from '../validators/schemas';

const router = Router();

router.use(authenticate);

router.get('/', getCategories);
router.post('/', validate(categorySchema), createCategory);
router.put('/:id', validate(categorySchema), updateCategory);
router.delete('/:id', deleteCategory);

export default router;
