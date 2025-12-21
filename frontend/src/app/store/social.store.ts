import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthStore } from '../auth/auth.store';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Friend {
  id: string;
  username: string;
  status: string;
}

export interface GameInvite {
  id: number;
  inviterName: string;
  roomCode: string;
}

export interface FriendRequest {
  id: number;
  senderName: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocialStore {
  private http = inject(HttpClient);
  private auth = inject(AuthStore);

  private _friends = signal<Friend[]>([]);
  private _gameInvites = signal<GameInvite[]>([]);
  private _friendRequests = signal<FriendRequest[]>([]);

  readonly friends = computed(() => this._friends());
  readonly invites = computed(() => this._gameInvites()); 
  readonly friendRequests = computed(() => this._friendRequests());

  loadSocialData() {
    const user = this.auth.user();
    if (!user) return;

    this.http.get<Friend[]>(`${environment.apiUrl}/social/friends?userId=${user.id}`).subscribe(res => {
      this._friends.set(res);
    });

    this.http.get<GameInvite[]>(`${environment.apiUrl}/social/invites?userId=${user.id}`).subscribe(res => {
      this._gameInvites.set(res);
    });

    this.http.get<FriendRequest[]>(`${environment.apiUrl}/social/friend-requests?userId=${user.id}`).subscribe(res => {
      this._friendRequests.set(res);
    });
  }

  respondToInvite(inviteId: number, accept: boolean) {
    this.http.post(`${environment.apiUrl}/social/invite/${inviteId}/respond?accept=${accept}`, {}).subscribe(() => {
      this.loadSocialData();
    });
  }

  sendInvite(inviteeName: string, roomCode: string) {
    const user = this.auth.user();
    if (!user) return;
    this.http.post(`${environment.apiUrl}/social/invite?inviterId=${user.id}&inviteeName=${inviteeName}&roomCode=${roomCode}`, {}).subscribe();
  }

  searchUsers(query: string): Observable<Friend[]> {
    const user = this.auth.user();
    if (!user) return of([]);
    return this.http.get<Friend[]>(`${environment.apiUrl}/social/search?query=${query}&userId=${user.id}`);
  }

  sendFriendRequest(friendUsername: string) {
    const user = this.auth.user();
    if (!user) return;
    this.http.post(`${environment.apiUrl}/social/friend-request/send?userId=${user.id}&friendUsername=${friendUsername}`, {}).subscribe({
      next: () => this.loadSocialData(),
      error: (err) => alert(err.error?.message || 'Failed to send request')
    });
  }

  respondToFriendRequest(requestId: number, accept: boolean) {
    this.http.post(`${environment.apiUrl}/social/friend-request/${requestId}/respond?accept=${accept}`, {}).subscribe(() => {
      this.loadSocialData();
    });
  }

  removeFriend(friendId: string) {
    const user = this.auth.user();
    if (!user) return;
    this.http.delete(`${environment.apiUrl}/social/remove-friend?userId=${user.id}&friendId=${friendId}`).subscribe(() => {
      this.loadSocialData();
    });
  }
}
