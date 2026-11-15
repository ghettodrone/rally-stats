import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'matches',
    title: 'Match history · RallyStats',
    loadComponent: () =>
      import('./features/history/history').then((m) => m.History),
  },
  {
    path: 'profile',
    title: 'Profile · RallyStats',
    loadComponent: () =>
      import('./features/profile/profile').then((m) => m.Profile),
  },
  {
    path: '',
    pathMatch: 'full',
    title: 'Overview ',
    loadComponent: () => 
      import('./features/overview/overview').then((m) => m.Overview),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
