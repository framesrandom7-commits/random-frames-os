import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { QuotationsService } from './quotations.service';

const CreateQuotationSchema = z.object({
  total: z.number().positive(),
  clientId: z.string().uuid().optional(),
  leadId: z.string().uuid().optional(),
});

const UpdateQuotationSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  total: z.number().positive().optional(),
});

export class QuotationsController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CreateQuotationSchema.parse(req.body);
      const quotation = await QuotationsService.create(data);
      res.status(201).json({ success: true, data: quotation });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const quotations = await QuotationsService.getAll();
      res.json({ success: true, data: quotations });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = UpdateQuotationSchema.parse(req.body);
      const quotation = await QuotationsService.update(req.params.id, data);
      res.json({ success: true, data: quotation });
    } catch (error: any) {
      if (['Quotation not found', 'Approved quotation cannot be modified'].includes(error.message)) {
        return res.status(400).json({ success: false, error: error.message });
      }
      next(error);
    }
  }
}
