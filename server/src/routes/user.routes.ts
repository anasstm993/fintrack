import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getMe, updateMe, changePassword, updateAvatar } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema, changePasswordSchema } from '../validators/schemas';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

router.use(authenticate);

router.get('/me', getMe);
router.put('/me', validate(updateProfileSchema), updateMe);
router.put('/password', validate(changePasswordSchema), changePassword);
router.put('/avatar', upload.single('avatar'), updateAvatar);

export default router;
