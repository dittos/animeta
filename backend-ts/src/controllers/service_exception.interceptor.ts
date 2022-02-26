import {
  ExecutionContext,
  NestInterceptor,
  CallHandler,
  Injectable,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PermissionError, ValidationError } from 'src/services/exceptions';
import { ApiException } from './exceptions';

@Injectable()
export class ServiceExceptionInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof ValidationError) {
          return throwError(() => new ApiException(error.message, HttpStatus.BAD_REQUEST));
        } else if (error instanceof PermissionError) {
          return throwError(() => ApiException.permissionDenied());
        }
        return throwError(() => error);
      }),
    );
  }
}
