import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApprovalsService } from './approvals.service';

const RequestApprovalSchema = z.object({
  type: z.enum(['PROJECT', 'INVOICE', 'EXPENSE']),
  referenceId: z.string().uuid(),
});

const ProcessApprovalSchema = z.object({
  comment: z.string().optional(),
});

export class ApprovalsController {
  static async request(req: Request, res: Response, next: NextFunction) {
    try {
      const data = RequestApprovalSchema.parse(req.body);
      const approval = await ApprovalsService.requestApproval({
        ...data,
        requestedById: (req as any).user.id,
      });
      res.status(201).json({ success: true, data: approval });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const approvals = await ApprovalsService.getAll();
      res.json({ success: true, data: approvals });
    } catch (error) {
      next(error);
    }
  }

  static async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const data = ProcessApprovalSchema.parse(req.body || {});
      const approval = await ApprovalsService.process(req.params.id, 'APPROVED', (req as any).user.id, data.comment);
      res.json({ success: true, data: approval });
    } catch (error) {
      next(error);
    }
  }

  static async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const data = ProcessApprovalSchema.parse(req.body || {});
      const approval = await ApprovalsService.process(req.params.id, 'REJECTED', (req as any).user.id, data.comment);
      res.json({ success: true, data: approval });
    } catch (error) {
      next(error);
    }
  }
}
