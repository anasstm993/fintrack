import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { UnauthorizedError } from '../utils/errors';
import prisma from '../utils/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token required');
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    // Verify user still exists in DB (handles database resets)
    prisma.user.findUnique({ where: { id: payload.userId } }).then((user) => {
      if (!user) {
        return next(new UnauthorizedError('User no longer exists. Please register again.'));
      }
      req.user = payload;
      next();
    }).catch(() => {
      next(new UnauthorizedError('Authentication failed'));
    });
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
}
