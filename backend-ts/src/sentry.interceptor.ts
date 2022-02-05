import {
  ExecutionContext,
  NestInterceptor,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as Sentry from '@sentry/node';

export class SentryInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (!(error instanceof HttpException)) {
          Sentry.captureException(error);
        }
        return throwError(error);
      }),
    );
  }
}
