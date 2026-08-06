import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

interface ErrorBody {
  statusCode: number;
  message: string;
  code?: string;
  issues?: unknown;
  path: string;
  timestamp: string;
}

/**
 * Central exception filter producing a consistent JSON error envelope:
 * `{ statusCode, message, code, issues, path, timestamp }`.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<{ url?: string; body?: unknown }>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code: string | undefined;
    let issues: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (res && typeof res === 'object') {
        const body = res as {
          message?: unknown;
          issues?: unknown;
          code?: string;
        };
        if (Array.isArray(body.message)) {
          message = body.message.join(', ');
        } else {
          message = String(body.message ?? message);
        }
        issues = body.issues;
        code = body.code;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (status >= 500) {
      this.logger.error(
        `${request.url ?? 'unknown'} -> ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    if (status === 400) {
      this.logger.warn(
        `Bad Request (400) to ${request.url ?? 'unknown'}. Body:`,
        request.body,
      );
    }

    const body: ErrorBody = {
      statusCode: status,
      message,
      code,
      issues,
      path: request.url ?? '',
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(body);
  }
}
