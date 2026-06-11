import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private snackBar: MatSnackBar) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMsg = '';
        if (error.error instanceof ErrorEvent) {
          // Client side error
          errorMsg = `Error: ${error.error.message}`;
        } else {
          // Server side error
          if (error.status === 0) {
            errorMsg = 'Server is unreachable. Please check your connection or try again later.';
          } else if (error.status === 401) {
            errorMsg = 'Unauthorized access. Please login again.';
          } else {
            errorMsg = error.error?.message || error.error?.msg || (typeof error.error === 'string' ? error.error : JSON.stringify(error.error)) || `Server Error: ${error.status} ${error.statusText}`;
          }
        }

        // Use timeout to prevent "ExpressionChangedAfterItHasBeenCheckedError" in some heavy views
        setTimeout(() => {
          this.snackBar.open(errorMsg, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['snackbar-danger'] // assuming this custom class exists based on previous code
          });
        }, 0);

        return throwError(() => new Error(errorMsg));
      })
    );
  }
}
