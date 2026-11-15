import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { PRIMEUI_LICENSE_KEY } from './theme/primeui-license';
import { RallyPreset } from './theme/rally-preset';
import { LocalStorageMatchRepository, MatchRepository } from './core/data/match.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    providePrimeNG({
      ripple: false,
      license: PRIMEUI_LICENSE_KEY,
      theme: {
        preset: RallyPreset,
        options: {
          darkModeSelector: '.rs-dark',
          cssLayer: { name: 'primeng', order: 'reset, primeng' },
        },
      },
    }),
    MessageService,
    ConfirmationService,
   { provide: MatchRepository, useClass: LocalStorageMatchRepository },
  ],
};
