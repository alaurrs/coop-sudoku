import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthStore } from '../auth/auth.store';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-[#fff5f7] dark:bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      
      <!-- Background -->
      <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20"></div>
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-200/20 dark:bg-purple-500/20 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/20 dark:bg-blue-500/20 rounded-full blur-[120px]"></div>

      <div class="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-10 rounded-[2.5rem] shadow-2xl relative z-10 transition-colors duration-300">
        
        <!-- Theme Toggle -->
        <button (click)="themeService.toggleTheme()" class="absolute top-6 right-6 size-10 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-400">
           <span class="material-symbols-outlined">{{ themeService.isDark() ? 'light_mode' : 'dark_mode' }}</span>
        </button>

        <!-- Header -->
        <div class="text-center mb-10">
           <div class="inline-flex items-center justify-center size-14 bg-blue-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/30">
              <span class="material-symbols-outlined text-white text-3xl">grid_view</span>
           </div>
           <h2 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ isRegister() ? 'Create Account' : 'Welcome Back' }}</h2>
           <p class="text-slate-500 dark:text-slate-400 text-sm mt-3 font-medium">
              {{ isRegister() ? 'Join the community of solvers.' : 'Enter your details to access your account.' }}
           </p>
        </div>

        <!-- Avatar Selection (Netflix style) -->
        <div *ngIf="isRegister()" class="mb-10">
           <label class="block text-[10px] font-black text-rose-500 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 text-center">Choose your Avatar</label>
           <div class="grid grid-cols-4 gap-4">
              <button *ngFor="let av of avatars" (click)="selectedAvatar.set(av)"
                      class="aspect-square rounded-xl overflow-hidden border-4 transition-all hover:scale-110 active:scale-95"
                      [class.border-blue-500]="selectedAvatar() === av"
                      [class.border-transparent]="selectedAvatar() !== av"
                      [class.shadow-lg]="selectedAvatar() === av">
                 <img [src]="getAvatarUrl(av)" class="w-full h-full object-cover">
              </button>
           </div>
        </div>

        <!-- Form -->
        <form (submit)="onSubmit()">
           <div class="space-y-6">
              <div>
                 <label class="block text-[10px] font-black text-rose-500 dark:text-slate-500 uppercase tracking-[0.2em] mb-3">Username</label>
                 <input type="text" [(ngModel)]="username" name="username" required
                        class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
                        placeholder="e.g. SudokuMaster">
              </div>
              
              <div>
                 <label class="block text-[10px] font-black text-rose-500 dark:text-slate-500 uppercase tracking-[0.2em] mb-3">Password</label>
                 <input type="password" [(ngModel)]="password" name="password" required
                        class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-inner"
                        placeholder="••••••••">
              </div>
           </div>

           <div *ngIf="error()" class="mt-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-3">
              <span class="material-symbols-outlined text-xl">error</span>
              {{ error() }}
           </div>

           <button type="submit" [disabled]="loading()"
                   class="w-full mt-10 h-14 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black uppercase tracking-widest text-sm rounded-2xl transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3 active:scale-95">
              <span *ngIf="loading()" class="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              {{ isRegister() ? 'Sign Up' : 'Log In' }}
           </button>
        </form>

        <!-- Toggle Mode -->
        <div class="mt-8 text-center text-sm text-slate-500 dark:text-slate-500 font-medium">
           {{ isRegister() ? 'Already have an account?' : "Don't have an account?" }}
           <button (click)="toggleMode()" class="text-blue-600 dark:text-blue-400 hover:underline font-black ml-1">
              {{ isRegister() ? 'Log In' : 'Sign Up' }}
           </button>
        </div>

      </div>
    </div>
  `
})
export class AuthPageComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authStore = inject(AuthStore);
  public themeService = inject(ThemeService);

  isRegister = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);

  username = '';
  password = '';
  
  avatars = ['av1', 'av2', 'av3', 'av4', 'av5', 'av6', 'av7', 'av8'];
  selectedAvatar = signal('av1');

  constructor() {
    this.route.queryParams.subscribe(params => {
        this.isRegister.set(params['mode'] === 'register');
    });
  }

  getAvatarUrl(name: string) {
    if (name === 'guest') return 'https://api.dicebear.com/7.x/bottts/svg?seed=guest';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  }

  toggleMode() {
    this.isRegister.update(v => !v);
    this.error.set(null);
  }

  onSubmit() {
    if (!this.username || !this.password) return;
    
    this.loading.set(true);
    this.error.set(null);

    if (this.isRegister()) {
        this.authStore.register(this.username, this.password, this.selectedAvatar());
    } else {
        this.authStore.login(this.username, this.password);
    }
    
    // Note: We'd ideally handle the loading/error state via effects or by returning observables from store
    // For now, let's just reset loading after a delay or use local component state
    setTimeout(() => this.loading.set(false), 1000);
  }
}