import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TasksService } from './tasks.service';

const CreateTaskSchema = z.object({
  title: z.string().min(2),
  projectId: z.string().uuid(),
  assignedToId: z.string().uuid().optional(),
});

const UpdateTaskSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  assignedToId: z.string().uuid().optional(),
});

export class TasksController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CreateTaskSchema.parse(req.body);
      const task = await TasksService.create(data);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tasks = await TasksService.getAll();
      res.json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = UpdateTaskSchema.parse(req.body);
      const task = await TasksService.update(req.params.id, data);
      res.json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }
}
