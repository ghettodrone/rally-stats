import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * All data lives in the visitor's localStorage, so pages are rendered in the browser.
 * Prerendering would only ship an empty shell that flashes before the real data loads.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
