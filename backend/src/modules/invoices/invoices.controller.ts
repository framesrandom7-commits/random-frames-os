import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { InvoicesService } from './invoices.service';

const CreateInvoiceSchema = z.object({
  amount: z.number().positive(),
  projectId: z.string().uuid(),
});

const UpdateInvoiceSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'OVERDUE']).optional(),
});

export class InvoicesController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CreateInvoiceSchema.parse(req.body);
      const invoice = await InvoicesService.create(data);
      res.status(201).json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const invoices = await InvoicesService.getAll();
      res.json({ success: true, data: invoices });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = UpdateInvoiceSchema.parse(req.body);
      const invoice = await InvoicesService.update(req.params.id, data);
      res.json({ success: true, data: invoice });
    } catch (error) {
      next(error);
    }
  }
}
