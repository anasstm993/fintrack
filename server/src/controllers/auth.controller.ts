import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { ConflictError, UnauthorizedError, BadRequestError } from '../utils/errors';
import { defaultCategories } from '../constants/categories';
import crypto from 'crypto';



async function seedCategoriesForUser(userId: string) {
  const data = defaultCategories.map((cat) => ({ ...cat, userId }));
  await prisma.$transaction(
    data.map((cat) =>
      prisma.category.upsert({
        where: {
          name_type_userId: { name: cat.name, type: cat.type, userId: cat.userId },
        },
        update: {},
        create: cat,
      })
    )
  );
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    await seedCategoriesForUser(user.id);

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

    await prisma.refreshToken.create({
      data: {
        token: hashedRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

    await prisma.refreshToken.create({
      data: {
        token: hashedRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new BadRequestError('Refresh token required');
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: hashedToken },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      }
      throw new UnauthorizedError('Refresh token expired or invalid');
    }

    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const newAccessToken = generateAccessToken({ userId: payload.userId, email: payload.email });
    const newRefreshToken = generateRefreshToken({ userId: payload.userId, email: payload.email });

    const newHashedToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

    await prisma.refreshToken.create({
      data: {
        token: newHashedToken,
        userId: payload.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await prisma.refreshToken.deleteMany({ where: { token: hashedToken } });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}
