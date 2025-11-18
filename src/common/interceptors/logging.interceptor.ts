/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext, GqlContextType } from '@nestjs/graphql';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Logging');

  private stringify(data: any): string {
    try {
      return JSON.stringify(data)?.slice(0, 10);
    } catch {
      return String(data);
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const type = context.getType<GqlContextType>();

    /** ============================
     *  1) HTTP REQUEST LOG
     * ============================ */
    if (type === 'http') {
      const req = context.switchToHttp().getRequest();

      const method = req.method;
      const url = req.url;

      this.logger.log(
        `[HTTP REQUEST] ${method} ${url} | Body: ${this.stringify(req.body)}`,
      );

      return next.handle().pipe(
        tap((response) => {
          const rt = Date.now() - startTime;
          this.logger.log(
            `[HTTP RESPONSE] ${method} ${url} | Response: ${this.stringify(
              response,
            )} | ${rt}ms`,
          );
        }),
        catchError((err) => {
          const rt = Date.now() - startTime;
          this.logger.error(
            `[HTTP ERROR] ${method} ${url} | ${err.message} | ${rt}ms`,
          );
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return throwError(() => err);
        }),
      );
    }

    /** ============================
     *  2) GRAPHQL REQUEST LOG
     * ============================ */
    if (type === 'graphql') {
      const gql = GqlExecutionContext.create(context);
      const req = gql.getContext().req;

      this.logger.log(
        `[GQL REQUEST] Query: ${this.stringify(
          req?.body?.query,
        )} | Variables: ${this.stringify(req?.body?.variables)}`,
      );

      return next.handle().pipe(
        tap((response) => {
          const rt = Date.now() - startTime;

          this.logger.log(
            `[GQL RESPONSE] Data: ${this.stringify(response)} | ${rt}ms`,
          );
        }),
        catchError((err) => {
          const rt = Date.now() - startTime;

          this.logger.error(
            `[GQL ERROR] ${err.message} | Query: ${this.stringify(
              req?.body?.query,
            )} | Vars: ${this.stringify(req?.body?.variables)} | ${rt}ms`,
          );

          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return throwError(() => err);
        }),
      );
    }

    return next.handle();
  }
}
