/**
 * Custom Error Classes and Error Handling Utilities
 * @owner: Sujal (Shared - Both review)
 * @purpose: Standardized error handling across the application
 */

import logger from './logger.js';

/**
 * Base Application Error
 */
export class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

/**
 * Validation Error (422)
 */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = []) {
    super(message, 422);
    this.errors = errors;
  }
}

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500, false);
  }
}

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error
  if (err.statusCode >= 500) {
    logger.error('❌ Server Error:', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.warn('⚠️ Client Error:', {
      error: err.message,
      path: req.path,
      method: req.method,
    });
  }

  // Send error response
  if (process.env.NODE_ENV === 'production' && err.statusCode >= 500) {
    // Don't leak error details in production
    res.status(err.statusCode).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  } else {
    // Development: Send full error details
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }
};

/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to catch errors
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Not Found Handler
 */
export const notFoundHandler = (req, res, next) => {
  const err = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(err);
};

