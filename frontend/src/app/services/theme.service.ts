import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private theme = signal<'light' | 'dark'>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const currentTheme = this.theme();
      localStorage.setItem('theme', currentTheme);
      if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }

  toggleTheme() {
    this.theme.update(t => t === 'light' ? 'dark' : 'light');
  }

  isDark() {
    return this.theme() === 'dark';
  }

  private getInitialTheme(): 'light' | 'dark' {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      return savedTheme;
    }
    // Default to dark as it was the original theme
    return 'dark';
  }
}
