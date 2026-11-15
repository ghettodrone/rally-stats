import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Overview · RallyStats',
    loadComponent: () => import('./features/overview/overview').then((m) => m.Overview),
  },
  {
    path: 'matches',
    title: 'Match history · RallyStats',
    loadComponent: () => import('./features/history/history').then((m) => m.History),
  },
  {
    path: 'matches/new',
    title: 'Add match · RallyStats',
    loadComponent: () => import('./features/match-form/match-form').then((m) => m.MatchForm),
  },
  {
    path: 'matches/:id',
    title: 'Match · RallyStats',
    loadComponent: () => import('./features/match-detail/match-detail').then((m) => m.MatchDetail),
  },
  {
    path: 'matches/:id/edit',
    title: 'Edit match · RallyStats',
    loadComponent: () => import('./features/match-form/match-form').then((m) => m.MatchForm),
  },
  {
    path: 'profile',
    title: 'Profile · RallyStats',
    loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
  },
  { path: '**', redirectTo: '' },
];
