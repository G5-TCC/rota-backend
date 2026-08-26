import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: unknown) => {
        // Se for Buffer (binário), não transforma para JSON
        if (Buffer.isBuffer(data)) {
          return data;
        }

        let message = 'Operation successful';
        let resultData = data;

        if (data && typeof data === 'object' && 'message' in data) {
          const { message: customMessage, ...rest } = data as Record<
            string,
            any
          >;
          message = customMessage;
          resultData = rest;
        }

        return {
          success: true,
          message,
          data: resultData ?? {},
        };
      }),
    );
  }
}
