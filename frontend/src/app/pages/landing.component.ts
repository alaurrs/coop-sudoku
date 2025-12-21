import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthStore } from '../auth/auth.store';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-[#fff5f7] dark:bg-[#0f172a] text-slate-900 dark:text-white font-sans flex flex-col relative overflow-hidden transition-colors duration-300">
      
      <!-- Background Effects -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-500/10 dark:from-blue-900/20 to-transparent pointer-events-none"></div>
      <div class="absolute -top-40 -right-40 size-96 bg-indigo-500/10 dark:bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div class="absolute top-40 -left-20 size-72 bg-blue-500/5 dark:bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <!-- Navbar -->
      <nav class="relative z-10 px-6 h-20 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div class="flex items-center gap-3">
           <div class="size-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
             <span class="material-symbols-outlined text-white">grid_view</span>
           </div>
           <span class="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Sudoku Co-op</span>
        </div>
        <div class="flex items-center gap-4">
           <button (click)="themeService.toggleTheme()" class="size-10 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-500 dark:text-slate-400">
              <span class="material-symbols-outlined">{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</span>
           </button>
           <a routerLink="/auth" [queryParams]="{mode: 'login'}" class="px-5 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">Log In</a>
           <a routerLink="/auth" [queryParams]="{mode: 'register'}" class="px-5 py-2.5 text-sm font-bold bg-white dark:bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-50 dark:hover:bg-white shadow-sm transition-colors">Sign Up</a>
        </div>
      </nav>

      <!-- Hero -->
      <main class="flex-1 flex flex-col items-center justify-center text-center px-6 relative z-10 pb-20">
         <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span class="size-2 rounded-full bg-blue-500 animate-pulse"></span>
            New Multiplayer Mode
         </div>
         
         <h1 class="text-5xl md:text-7xl font-black tracking-tight mb-6 max-w-4xl bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Solve Sudoku Together in Real-Time
         </h1>
         
         <p class="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Collaborate with friends or challenge yourself. No more lonely solving. 
            Experience the first truly cooperative Sudoku platform.
         </p>
         
         <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <button (click)="playAsGuest()" class="h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95">
               <span class="material-symbols-outlined">person</span>
               Play as Guest
            </button>
            <a routerLink="/auth" [queryParams]="{mode: 'register'}" class="h-14 px-8 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold text-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-sm">
               <span class="material-symbols-outlined">rocket_launch</span>
               Create Account
            </a>
         </div>

         <!-- Stats / Trust -->
         <div class="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 opacity-80 dark:opacity-60">
            <div>
               <div class="text-3xl font-black text-slate-900 dark:text-white">10k+</div>
               <div class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">Puzzles Solved</div>
            </div>
            <div>
               <div class="text-3xl font-black text-slate-900 dark:text-white">Instant</div>
               <div class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">Sync</div>
            </div>
            <div>
               <div class="text-3xl font-black text-slate-900 dark:text-white">Hard</div>
               <div class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">Difficulty</div>
            </div>
            <div>
               <div class="text-3xl font-black text-slate-900 dark:text-white">Free</div>
               <div class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">Forever</div>
            </div>
         </div>

      </main>

    </div>
  `
})
export class LandingComponent {
  private router = inject(Router);
  private auth = inject(AuthStore);
  public themeService = inject(ThemeService);

  playAsGuest() {
    if (this.auth.isAuthenticated()) {
        this.router.navigate(['/lobby']);
        return;
    }
    
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const name = `Guest${randomId}`;
    this.auth.guestLogin(name);
  }
}
