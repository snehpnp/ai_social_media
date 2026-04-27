import { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middlewares/authMiddleware';
import { hashPassword } from '../utils/auth';

export const createUserByAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name, role, plan } = req.body;

    // Only Admins can do this
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Admin access only' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'USER',
        plan: plan || 'FREE',
      },
    });

    res.status(201).json({ message: 'User created successfully', user: { id: user.id, email: user.email, name: user.name } });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden: Admin access only' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        aiUsageCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, plan: true, aiUsageCount: true, createdAt: true }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserByAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, plan } = req.body;

    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { name, email, role, plan }
    });

    res.status(200).json({ message: 'User updated successfully', user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUserByAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const posts = await prisma.post.findMany({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(posts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/settings
export const getSystemSettings = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const settings = await prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });

    // Convert to Map
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    res.json(settingsMap);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/admin/settings
export const updateSystemSettings = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updates = req.body; // { FACEBOOK_APP_ID: "...", FACEBOOK_APP_SECRET: "..." }

    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'string') {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
