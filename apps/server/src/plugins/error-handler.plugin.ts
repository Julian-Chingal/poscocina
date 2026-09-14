import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { AppError } from '../errors/app-error.js';
import { env } from '../config/env.js';

export const errorHandlerPlugin = fp(async function (fastify: FastifyInstance) {
  fastify.setErrorHandler((error: FastifyError | AppError | Error, request: FastifyRequest, reply: FastifyReply) => {
    // 1. Application-specific domain errors
    if (error instanceof AppError) {
      request.log.warn(
        {
          err: {
            name: error.name,
            message: error.message,
            statusCode: error.statusCode,
            code: error.code,
            details: error.details,
          },
          url: request.url,
          method: request.method,
        },
        `AppError: ${error.message}`
      );

      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        error: error.code,
        message: error.message,
        details: error.details,
      });
    }

    // 2. Fastify validation errors
    if ('validation' in error && error.validation) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'VALIDATION_ERROR',
        message: 'Error de validación de parámetros de la petición',
        details: error.validation,
      });
    }

    // 3. Known Fastify / HTTP errors
    const statusCode = (error as FastifyError).statusCode || 500;
    const errorCode = (error as FastifyError).code || 'INTERNAL_SERVER_ERROR';

    // Log severe unexpected errors
    request.log.error(
      {
        err: error,
        url: request.url,
        method: request.method,
        params: request.params,
        query: request.query,
      },
      'Unhandled Server Error'
    );

    // Hide internal details in production
    const message =
      statusCode >= 500 && env.NODE_ENV === 'production'
        ? 'Error interno del servidor. Por favor intente más tarde.'
        : error.message;

    return reply.status(statusCode).send({
      statusCode,
      error: errorCode,
      message,
    });
  });
});
