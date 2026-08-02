import type { Request, Response, NextFunction } from 'express';
import { type AnySchema, ValidationError } from 'yup';
import { ApiError } from '../validations/api-error.js';

export const validateRequest = (schema: AnySchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = await schema.validate({
                body: req.body,
                query: req.query,
                params: req.params,
            }, { abortEarly: false, stripUnknown: true });
            
            // Re-assign validated values back to request
            req.body = validated.body;
            Object.defineProperty(req, 'query', { value: validated.query, writable: true, configurable: true });
            Object.defineProperty(req, 'params', { value: validated.params, writable: true, configurable: true });
            
            next();
        } catch (error) {
            if (error instanceof ValidationError) {
                const errors = error.inner.map(err => err.message);
                next(new ApiError(400, errors.join(', ')));
            } else {
                next(error);
            }
        }
    };
};
