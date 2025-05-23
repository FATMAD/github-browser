import { Routes } from '@angular/router';

export const routes: Routes = [

     {
    path: 'repos',
    loadChildren: () => import('./features/repos/repos.routes').then(m => m.REPOS_ROUTES)
  },
  {
    path: 'commits',
    loadChildren: () => import('./features/commits/commits.routes').then(m => m.COMMITS_ROUTES)
  },
  { path: '', redirectTo: 'repos', pathMatch: 'full' },
  { path: '**', redirectTo: 'repos' }
];
