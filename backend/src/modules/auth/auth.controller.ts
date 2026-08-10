import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthService } from './auth.service';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['FOUNDER', 'CO_FOUNDER']).optional(),
});

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = LoginSchema.parse(req.body);
      const result = await AuthService.login(data.email, data.password);
      res.json({ success: true, data: result });
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ success: false, error: error.message });
      }
      next(error);
    }
  }

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = RegisterSchema.parse(req.body);
      const user = await AuthService.register(data);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}
