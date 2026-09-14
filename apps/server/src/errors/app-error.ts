export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado', details?: unknown) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Petición inválida', details?: unknown) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado o sesión expirada', details?: unknown) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado: permisos insuficientes', details?: unknown) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflicto con el estado actual del recurso', details?: unknown) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Error de validación de datos', details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}
