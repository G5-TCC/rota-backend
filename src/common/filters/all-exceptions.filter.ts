import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import * as Sentry from '@sentry/nestjs';
import { DomainError } from '../domain/errors/domain.error';
import { Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';

    // Tratar erros de domínio (Negócio)
    if (exception instanceof DomainError) {
      httpStatus = exception.statusCode;
      message = exception.message;
      errorCode = exception.errorCode;
    }
    // Tratar exceções conhecidas do NestJS
    else if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const response = exception.getResponse();
      const responseBody =
        typeof response === 'object' && response !== null
          ? (response as Record<string, any>)
          : { message: response };
      message = responseBody.message || exception.message;
      errorCode = responseBody.error || 'HTTP_ERROR';
    }
    // Tratar erros específicos do Prisma (Database)
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': // Unique constraint failed
          httpStatus = HttpStatus.CONFLICT;
          message = `O registro já existe.`;
          errorCode = 'UNIQUE_CONSTRAINT_FAILED';
          break;
        case 'P2025': // Record not found
          httpStatus = HttpStatus.NOT_FOUND;
          message = 'Registro não encontrado.';
          errorCode = 'NOT_FOUND';
          break;
        default:
          httpStatus = HttpStatus.BAD_REQUEST;
          message = 'Erro na operação de banco de dados.';
          errorCode = `DATABASE_ERROR_${exception.code}`;
      }
    }

    // Logar e enviar para o Sentry apenas se for um erro interno (500)
    if (httpStatus >= (HttpStatus.INTERNAL_SERVER_ERROR as number)) {
      Sentry.captureException(exception);

      this.logger.error(
        `Path: ${request.url} | Method: ${request.method} | Error: ${
          exception instanceof Error
            ? exception.stack
            : JSON.stringify(exception)
        }`,
      );
    }

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request),
      message,
      errorCode,
      requestId: request.headers['x-request-id'] as string | undefined,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
