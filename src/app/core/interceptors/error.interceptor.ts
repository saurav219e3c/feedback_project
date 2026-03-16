
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Log once centrally; you can inject a toast service here
      console.error('[HTTP ERROR]', {
        url: req.url,
        status: err.status,
        message: err.message,
        backend: err.error,
      });

      // Optionally, map specific statuses to user-friendly messages
      return throwError(() => err);
    })
  );
};
