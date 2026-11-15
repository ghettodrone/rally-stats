import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'matches',
    title: 'Match history · RallyStats',
    loadComponent: () => import('./features/history/history').then((m) => m.History),
  },
  { path: '**', redirectTo: '' },
];
