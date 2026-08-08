import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../validations/api-error.js';
import multer from 'multer';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(err);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        message: 'File size exceeds the 10MB limit.',
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: err.message,
    });
    return;
  }
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
    stack: err.stack,
  });
};
