import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { UnauthorizedError, BadRequestError, NotFoundError } from '../utils/errors';

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email } = req.body;
    const userId = req.user!.userId;

    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } },
      });
      if (existing) {
        throw new BadRequestError('Email already in use');
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
}

export async function updateAvatar(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    
    if (!req.file) {
      throw new BadRequestError('No file uploaded');
    }

    const avatarPath = `/uploads/${req.file.filename}`;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarPath },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
}
