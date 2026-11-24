import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { functionalAuthInterceptor } from '../examples/functional_auth_interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter([], withComponentInputBinding()),
    provideHttpClient(withInterceptors([functionalAuthInterceptor]))
  ]
};
