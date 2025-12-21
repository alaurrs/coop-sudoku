import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  username: string;
  token: string;
  avatar: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthStore {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private _user = signal<User | null>(this.loadUser());
  
  readonly user = computed(() => this._user());
  readonly isAuthenticated = computed(() => !!this._user());

  login(username: string, password?: string) {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { username, password }).subscribe({
      next: (res) => {
        this.setUser(res);
        this.router.navigate(['/lobby']);
      },
      error: (err) => console.error('Login failed', err)
    });
  }

  register(username: string, password?: string, avatar?: string) {
    return this.http.post<any>(`${environment.apiUrl}/auth/register`, { username, password, avatar }).subscribe({
      next: (res) => {
        this.setUser(res);
        this.router.navigate(['/lobby']);
      },
      error: (err) => console.error('Registration failed', err)
    });
  }

  guestLogin(username: string) {
    return this.http.post<any>(`${environment.apiUrl}/auth/guest`, { username }).subscribe({
      next: (res) => {
        this.setUser(res);
        this.router.navigate(['/lobby']);
      },
      error: (err) => console.error('Login failed', err)
    });
  }

  logout() {
    localStorage.removeItem('sudoku_user');
    this._user.set(null);
    this.router.navigate(['/']);
  }

  updateAvatar(avatar: string) {
    const user = this._user();
    if (!user) return;
    
    this.http.post<any>(`${environment.apiUrl}/auth/update-avatar`, { userId: user.id, avatar }).subscribe({
      next: (res) => this.setUser(res),
      error: (err) => console.error('Failed to update avatar', err)
    });
  }

  setSession(res: any) {
    this.setUser(res);
  }

  private setUser(res: any) {
    const user: User = { 
      id: res.userId, 
      username: res.username, 
      token: res.token,
      avatar: res.avatar || 'guest'
    };
    localStorage.setItem('sudoku_user', JSON.stringify(user));
    this._user.set(user);
  }

  private loadUser(): User | null {
    const saved = localStorage.getItem('sudoku_user');
    return saved ? JSON.parse(saved) : null;
  }
}
