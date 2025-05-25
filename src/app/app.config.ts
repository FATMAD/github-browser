import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimations } from '@angular/platform-browser/animations';
import lara from'@primeng/themes/lara';
import {providePrimeNG} from 'primeng/config'
import { SharedImports } from './shared/shared-imports';



export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    importProvidersFrom(
      BrowserAnimationsModule,
      SharedImports
    ),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: lara
      }
    })
  ]
};