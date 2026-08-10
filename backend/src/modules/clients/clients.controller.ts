import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ClientsService } from './clients.service';

const CreateClientSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  quotedAmount: z.number().positive(),
  approved: z.literal(true),
  approvalMethod: z.enum(['WHATSAPP', 'CALL', 'EMAIL', 'IN_PERSON', 'OTHER']),
});

export class ClientsController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CreateClientSchema.parse(req.body);
      const client = await ClientsService.create(data);
      res.status(201).json({ success: true, data: client });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const clients = await ClientsService.getAll();
      res.json({ success: true, data: clients });
    } catch (error) {
      next(error);
    }
  }
}
