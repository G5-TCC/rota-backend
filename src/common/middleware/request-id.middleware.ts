import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as Sentry from '@sentry/nestjs';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Tenta obter o ID do header existente ou gera um novo
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();

    // Garante que o ID está presente nos headers da requisição
    req.headers['x-request-id'] = requestId;

    // Adiciona o ID aos headers da resposta
    res.setHeader('x-request-id', requestId);

    // Adiciona o requestId como tag no escopo atual do Sentry
    Sentry.setTag('requestId', requestId);

    // Adiciona ao objeto request para o pino-http
    req['id'] = requestId;

    next();
  }
}
