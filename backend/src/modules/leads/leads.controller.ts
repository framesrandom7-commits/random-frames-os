import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { LeadsService } from './leads.service';

const CreateLeadSchema = z.object({
  name: z.string().min(2),
  assignedToId: z.string().optional(),
});

const UpdateLeadSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'CONVERTED', 'LOST']),
});

const ConvertLeadSchema = z.object({
  email: z.string().email(),
});

export class LeadsController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CreateLeadSchema.parse(req.body);
      const lead = await LeadsService.create(data);
      res.status(201).json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const leads = await LeadsService.getAll();
      res.json({ success: true, data: leads });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = UpdateLeadSchema.parse(req.body);
      const lead = await LeadsService.update(req.params.id, data);
      res.json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  }

  static async convert(req: Request, res: Response, next: NextFunction) {
    try {
      const data = ConvertLeadSchema.parse(req.body);
      const client = await LeadsService.convert(req.params.id, data.email);
      res.json({ success: true, data: client });
    } catch (error) {
      next(error);
    }
  }
}
