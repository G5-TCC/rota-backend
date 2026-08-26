import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import * as Sentry from '@sentry/nestjs';

interface RequestWithId extends Request {
  id: string;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Tenta obter o ID do header existente ou gera um novo
    const requestId =
      (Array.isArray(req.headers['x-request-id'])
        ? req.headers['x-request-id'][0]
        : req.headers['x-request-id']) || randomUUID();

    // Garante que o ID está presente nos headers da requisição
    req.headers['x-request-id'] = requestId;

    // Adiciona o ID aos headers da resposta
    res.setHeader('x-request-id', requestId);

    // Adiciona o requestId como tag no escopo atual do Sentry
    Sentry.setTag('requestId', requestId);

    // Adiciona ao objeto request para o pino-http
    (req as RequestWithId).id = requestId;

    next();
  }
}
