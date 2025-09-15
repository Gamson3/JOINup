import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export default function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  if (err instanceof ZodError) {
    return res.status(400).json({ success: false, message: 'Validation error', errors: err.issues });
  }
  return res.status(500).json({ success: false, message: 'Internal server error' });
}