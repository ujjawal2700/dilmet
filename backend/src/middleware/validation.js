/**
 * Request Validation Middleware
 * @owner: Sujal (Shared - Both review)
 * @purpose: Validate request data using express-validator
 */

import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors.js';

/**
 * Validate request - check for validation errors
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return next(new ValidationError('Validation failed', errorMessages));
  }

  next();
};

/**
 * Sanitize request body
 */
export const sanitize = (req, res, next) => {
  // Remove any undefined fields
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] === undefined) {
        delete req.body[key];
      }
    });
  }

  next();
};

