import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UsersService } from './users.service';

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['FOUNDER', 'CO_FOUNDER']),
});

export class UsersController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UsersService.getAll();
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CreateUserSchema.parse(req.body);
      const user = await UsersService.create(data);
      res.status(201).json({ success: true, data: user });
    } catch (error: any) {
      if (error.message === 'Email already in use') {
        return res.status(400).json({ success: false, error: error.message });
      }
      next(error);
    }
  }
}
