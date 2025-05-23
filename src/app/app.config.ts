import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimations } from '@angular/platform-browser/animations';
import lara from'@primeng/themes/lara';
import {providePrimeNG} from 'primeng/config'
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { TableModule } from 'primeng/table';


export const appConfig: ApplicationConfig = {
  providers: [
     provideZoneChangeDetection({ eventCoalescing: true }),
     provideRouter(routes), provideHttpClient(),
      importProvidersFrom(
      BrowserAnimationsModule,
      TableModule,
      ProgressSpinnerModule
    ),
     providePrimeNG ({
        theme :      
      {
        preset :lara
      }
     }),
     provideAnimations()
]
};
