import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStore } from './auth/auth.store';
import { Router } from '@angular/router';

// Guard pour les pages protégées (Lobby, Game)
const authGuard = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  return router.createUrlTree(['/']);
};

// Guard pour les pages publiques (Landing, Auth) -> Redirige vers lobby si connecté
const guestGuard = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  if (!auth.isAuthenticated()) return true;
  return router.createUrlTree(['/lobby']);
};

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./pages/landing.component').then(m => m.LandingComponent),
    canActivate: [guestGuard] 
  },
  { 
    path: 'auth', 
    loadComponent: () => import('./pages/auth.component').then(m => m.AuthPageComponent),
    canActivate: [guestGuard] 
  },
  { 
    path: 'lobby', 
    loadComponent: () => import('./game/lobby.component').then(m => m.LobbyComponent),
    canActivate: [authGuard] 
  },
  { 
    path: 'game', 
    loadComponent: () => import('./game/sudoku-board.component').then(m => m.SudokuBoardComponent),
    canActivate: [authGuard] 
  },
  { path: '**', redirectTo: '' }
];
