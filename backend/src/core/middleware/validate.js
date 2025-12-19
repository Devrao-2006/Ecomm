import { validationResult } from 'express-validator';
import { AppError } from '../errors/AppError.js';

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation error', 400, errors.array()));
  }
  return next();
}