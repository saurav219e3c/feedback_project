// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor'; // if you added centralized error handling
import { API_BASE_URL } from './core/config/api-tokens';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // Single place to configure your API root URL
    { provide: API_BASE_URL, useValue: 'http://localhost:5001' },

    // HttpClient + interceptors
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor, // remove this if you didn't add the error interceptor
      ])
    ),
  ],
};