import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const requireFounder = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'FOUNDER') {
    return res.status(403).json({ success: false, error: 'Forbidden. Requires FOUNDER role.' });
  }
  next();
};

export const requireCoFounder = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'FOUNDER' && req.user?.role !== 'CO_FOUNDER') {
    return res.status(403).json({ success: false, error: 'Forbidden. Requires at least CO_FOUNDER role.' });
  }
  next();
};
