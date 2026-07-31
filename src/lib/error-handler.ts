/**
 * Error Handler — Centralized error handling
 * Handles Supabase errors and converts them to user-friendly messages
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN',
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleSupabaseError(error: any): AppError {
  // Auth errors
  if (error.message?.includes('JWT')) {
    return new AppError('Authentication required', 'AUTH_ERROR', 401);
  }
  if (error.message?.includes('permission denied')) {
    return new AppError('You do not have permission to do this', 'FORBIDDEN', 403);
  }

  // RLS errors
  if (error.message?.includes('row-level security')) {
    return new AppError('Access denied', 'RLS_ERROR', 403);
  }

  // Duplicate key
  if (error.code === '23505') {
    return new AppError('This record already exists', 'DUPLICATE', 409);
  }

  // Foreign key violation
  if (error.code === '23503') {
    return new AppError('Referenced record not found', 'FOREIGN_KEY', 400);
  }

  // Check constraint
  if (error.code === '23514') {
    return new AppError('Invalid data: check constraint failed', 'VALIDATION', 400);
  }

  // Network errors
  if (error.message?.includes('Failed to fetch')) {
    return new AppError('Network error. Check your connection.', 'NETWORK', 503);
  }

  return new AppError(error.message || 'An unexpected error occurred', 'UNKNOWN', 500);
}

export function isAuthError(error: AppError): boolean {
  return error.statusCode === 401;
}

export function isForbiddenError(error: AppError): boolean {
  return error.statusCode === 403;
}

export function isValidationError(error: AppError): boolean {
  return error.statusCode === 400;
}