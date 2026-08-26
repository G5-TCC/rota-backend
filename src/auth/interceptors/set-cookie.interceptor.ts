import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

interface AuthData {
  clearCookie?: boolean;
  refreshToken?: string;
  expiresAt?: Date;
  [key: string]: any;
}

@Injectable()
export class SetCookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data: AuthData) => {
        if (data && data.clearCookie) {
          res.clearCookie('refreshToken');
          delete data.clearCookie;
        }

        if (data && data.refreshToken) {
          res.cookie('refreshToken', data.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            expires: data.expiresAt,
          });

          delete data.refreshToken;
          delete data.expiresAt;
        }
        return data;
      }),
    );
  }
}
