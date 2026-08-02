import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../validations/api-error.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Handle Multer payload too large error or other specific errors here if needed
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
