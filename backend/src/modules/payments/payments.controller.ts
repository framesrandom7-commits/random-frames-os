import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PaymentsService } from './payments.service';

const CreatePaymentSchema = z.object({
  amount: z.number().positive(),
  invoiceId: z.string().uuid(),
});

export class PaymentsController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CreatePaymentSchema.parse(req.body);
      const payment = await PaymentsService.create(data);
      res.status(201).json({ success: true, data: payment });
    } catch (error) {
      next(error);
    }
  }
}
