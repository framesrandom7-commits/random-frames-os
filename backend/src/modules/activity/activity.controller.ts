import { Request, Response, NextFunction } from 'express';
import { ActivityService } from './activity.service';

export class ActivityController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const activities = await ActivityService.getAll();
      res.json({ success: true, data: activities });
    } catch (error) {
      next(error);
    }
  }
}
