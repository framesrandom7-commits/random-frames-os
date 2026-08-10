import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ProjectsService } from './projects.service';

const CreateProjectSchema = z.object({
  title: z.string().min(2),
  clientId: z.string().uuid(),
  quotationId: z.string().uuid(),
});

export class ProjectsController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CreateProjectSchema.parse(req.body);
      const project = await ProjectsService.create(data);
      res.status(201).json({ success: true, data: project });
    } catch (error: any) {
      if (['Quotation not found', 'Quotation does not belong to the selected client', 'Project can only be created from an APPROVED quotation'].includes(error.message)) {
        return res.status(400).json({ success: false, error: error.message });
      }
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await ProjectsService.getAll();
      res.json({ success: true, data: projects });
    } catch (error) {
      next(error);
    }
  }
}
