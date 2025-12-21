import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  username: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthStore {
  private _user = signal<User | null>(this.loadUser());
  
  readonly user = computed(() => this._user());
  readonly isAuthenticated = computed(() => !!this._user());

  constructor(private http: HttpClient) {}

  login(username: string) {
    // For now, assume guest login if no password UI
    return this.guestLogin(username);
  }

  guestLogin(username: string) {
    return this.http.post<any>(`${environment.apiUrl}/auth/guest`, { username }).subscribe({
      next: (res) => this.setUser(res),
      error: (err) => console.error('Login failed', err)
    });
  }

  logout() {
    localStorage.removeItem('sudoku_user');
    this._user.set(null);
  }

  setSession(res: any) {
    this.setUser(res);
  }

  private setUser(res: any) {
    const user: User = { id: res.userId, username: res.username, token: res.token };
    localStorage.setItem('sudoku_user', JSON.stringify(user));
    this._user.set(user);
  }

  private loadUser(): User | null {
    const saved = localStorage.getItem('sudoku_user');
    return saved ? JSON.parse(saved) : null;
  }
}
