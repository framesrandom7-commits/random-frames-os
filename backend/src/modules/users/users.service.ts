import { prisma } from '../../config/prisma';
import bcrypt from 'bcryptjs';

export class UsersService {
  static async getAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  static async create(data: any) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }
}
