import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../services/web-socket.service';
import { GameSession, PlayerInfo, Suggestion, GameSummary, GameEvent } from '../models/game.models';
import { ChatMessage } from '../models/chat.models';
import { environment } from '../../environments/environment';
import { Subscription } from 'rxjs';

export interface GameState {
  roomId: string | null;
  grid: number[][]; 
  players: PlayerInfo[];
  currentUserId: string | null;
  currentUsername: string | null;
  currentUserAvatar: string | null;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  pendingSuggestion: Suggestion | null;
  selectedCell: { r: number, c: number } | null;
  chatMessages: ChatMessage[];
  mistakes: number;
  lastMoveStatus: 'CORRECT' | 'INCORRECT' | null;
  endReason: 'SOLVED' | 'SURRENDERED' | null;
  startTime: number;
  completedTime: number | null;
  difficulty: string;
  activeLobbies: GameSummary[];
  otherCursors: Map<string, {row: number, col: number, username: string}>;
}

const INITIAL_STATE: GameState = {
  roomId: null,
  grid: Array(9).fill([]).map(() => Array(9).fill(0)),
  players: [],
  currentUserId: null,
  currentUsername: null,
  currentUserAvatar: null,
  status: 'WAITING',
  pendingSuggestion: null,
  selectedCell: null,
  chatMessages: [],
  mistakes: 0,
  lastMoveStatus: null,
  endReason: null,
  startTime: 0,
  completedTime: null,
  difficulty: 'MEDIUM',
  activeLobbies: [],
  otherCursors: new Map()
};

@Injectable({
  providedIn: 'root'
})
export class GameStore {
  private ws = inject(WebSocketService);
  private router = inject(Router);
  private http = inject(HttpClient);
  
  private state = signal<GameState>(INITIAL_STATE);
  private gameSub: Subscription | null = null;
  private lobbySub: Subscription | null = null;

  // Selectors
  readonly roomId = computed(() => this.state().roomId);
  readonly status = computed(() => this.state().status);
  readonly grid = computed(() => this.state().grid);
  readonly players = computed(() => this.state().players);
  readonly currentUser = computed(() => this.state().currentUsername);
  readonly currentUserId = computed(() => this.state().currentUserId);
  readonly userAvatar = computed(() => this.state().currentUserAvatar);
  readonly selectedCell = computed(() => this.state().selectedCell);
  readonly pendingSuggestion = computed(() => this.state().pendingSuggestion);
  readonly chatMessages = computed(() => this.state().chatMessages);
  readonly mistakes = computed(() => this.state().mistakes);
  readonly lastMoveStatus = computed(() => this.state().lastMoveStatus);
  readonly endReason = computed(() => this.state().endReason);
  readonly startTime = computed(() => this.state().startTime);
  readonly completedTime = computed(() => this.state().completedTime);
  readonly difficulty = computed(() => this.state().difficulty);
  readonly activeLobbies = computed(() => this.state().activeLobbies);
  readonly otherCursors = computed(() => this.state().otherCursors);
  
  readonly isMyTurnToConfirm = computed(() => {
    const sugg = this.state().pendingSuggestion;
    return sugg && sugg.suggesterId !== this.state().currentUserId;
  });
  
  readonly canSuggest = computed(() => {
    return (this.state().status === 'IN_PROGRESS' || this.state().status === 'WAITING') && !this.state().pendingSuggestion;
  });

  constructor() {
    this.subscribeToLobby();
  }

  private subscribeToLobby() {
    if (this.lobbySub) return;
    this.lobbySub = this.ws.watchTopic('/topic/lobby').subscribe(lobbies => {
      this.state.update(s => ({ ...s, activeLobbies: lobbies }));
    });
  }

  loadLobbies() {
    this.http.get<GameSummary[]>(`${environment.apiUrl}/game/lobbies`).subscribe({
      next: (lobbies) => {
         this.state.update(s => ({ ...s, activeLobbies: lobbies }));
      },
      error: (err) => console.error('Failed to load lobbies', err)
    });
  }

  initGame(session: GameSession, user: {id: string, username: string, avatar: string}) {
    if (this.gameSub) this.gameSub.unsubscribe();
    
    this.gameSub = this.ws.watchTopic(`/topic/game/${session.roomId}`).subscribe((event: GameEvent) => {
      this.handleGameEvent(event);
    });
    
    this.state.update(s => ({
      ...s,
      roomId: session.roomId,
      grid: session.currentGrid,
      players: session.players,
      status: session.state,
      currentUserId: user.id,
      currentUsername: user.username,
      currentUserAvatar: user.avatar,
      startTime: session.startTime,
      completedTime: session.completedTime,
      difficulty: session.difficulty,
      pendingSuggestion: null,
      chatMessages: [],
      otherCursors: new Map()
    }));

    this.router.navigate(['/game']);
  }

  private handleGameEvent(event: GameEvent) {
    console.log('Store: Received Event', event.type, event.payload);
    switch (event.type) {
      case 'GAME_START':
      case 'PLAYER_JOINED':
        this.updateGameSession(event.payload);
        break;
      case 'SUGGEST_MOVE':
        this.state.update(s => ({ ...s, pendingSuggestion: event.payload }));
        break;
      case 'CONFIRM_MOVE':
        this.handleMoveConfirmed(event.payload);
        break;
      case 'REJECT_MOVE':
        this.state.update(s => ({ ...s, pendingSuggestion: null }));
        break;
      case 'GAME_CHAT':
        this.state.update(s => ({
           ...s,
           chatMessages: [...s.chatMessages, event.payload]
        }));
        break;
      case 'GAME_SURRENDERED':
        this.state.update(s => ({
           ...s,
           status: 'COMPLETED',
           endReason: 'SURRENDERED',
           completedTime: Date.now()
        }));
        break;
      case 'CURSOR_MOVE':
        this.handleCursorMove(event.payload);
        break;
    }
  }

  private handleCursorMove(payload: any) {
    if (payload.userId === this.state().currentUserId) return;
    
    this.state.update(s => {
      const newCursors = new Map(s.otherCursors);
      newCursors.set(payload.userId, { 
        row: payload.row, 
        col: payload.col, 
        username: payload.username 
      });
      return { ...s, otherCursors: newCursors };
    });
  }

  sendCursorPosition(row: number, col: number) {
    const s = this.state();
    if (!s.roomId || !s.currentUserId) return;
    
    this.ws.send(`/app/game/${s.roomId}/cursor`, {
      userId: s.currentUserId,
      username: s.currentUsername,
      row,
      col
    });
  }

  selectCell(r: number, c: number) {
    this.state.update(s => ({ ...s, selectedCell: { r, c } }));
    this.sendCursorPosition(r, c);
  }

  makeSuggestion(value: number) {
    const s = this.state();
    if (!s.selectedCell || !s.roomId || !s.currentUserId) return;
    if (s.status !== 'IN_PROGRESS' && s.status !== 'WAITING') return;
    if (s.pendingSuggestion) return;

    const { r, c } = s.selectedCell;
    this.ws.send(`/app/game/${s.roomId}/suggest`, {
      userId: s.currentUserId,
      row: r,
      col: c,
      value
    });
  }

  confirmSuggestion(accepted: boolean) {
    const s = this.state();
    if (!s.roomId || !s.currentUserId) return;
    
    this.ws.send(`/app/game/${s.roomId}/confirm`, {
      userId: s.currentUserId,
      accepted
    });
  }

  sendMessage(message: string) {
    const s = this.state();
    if (!s.roomId || !s.currentUserId || !message.trim()) return;

    this.ws.send(`/app/game/${s.roomId}/chat`, {
        userId: s.currentUserId,
        message
    });
  }

  surrenderGame() {
    const s = this.state();
    if (!s.roomId || !s.currentUserId) return;
    
    this.http.post(`${environment.apiUrl}/game/${s.roomId}/surrender?userId=${s.currentUserId}`, {}).subscribe({
        error: (err) => console.error('Surrender failed', err)
    });
  }

  resetGame() {
    if (this.gameSub) {
      this.gameSub.unsubscribe();
      this.gameSub = null;
    }
    this.state.update(s => ({
      ...INITIAL_STATE,
      currentUserId: s.currentUserId,
      currentUsername: s.currentUsername,
      currentUserAvatar: s.currentUserAvatar,
      activeLobbies: s.activeLobbies
    }));
    this.router.navigate(['/lobby']);
  }

  private updateGameSession(session: GameSession) {
    this.state.update(s => ({
      ...s,
      grid: session.currentGrid,
      players: session.players,
      status: session.state,
      startTime: session.startTime,
      completedTime: session.completedTime,
      difficulty: session.difficulty
    }));
  }

  private handleMoveConfirmed(result: any) {
    this.state.update(s => {
      const newGrid = s.grid.map((row: number[]) => [...row]);
      if (result.isCorrect) {
        newGrid[result.row][result.col] = result.value;
      }
      return {
        ...s,
        grid: newGrid,
        pendingSuggestion: null,
        status: result.isWin ? 'COMPLETED' : s.status,
        mistakes: !result.isCorrect ? s.mistakes + 1 : s.mistakes,
        lastMoveStatus: result.isCorrect ? 'CORRECT' : 'INCORRECT',
        endReason: result.isWin ? 'SOLVED' : s.endReason,
        completedTime: result.isWin ? Date.now() : s.completedTime
      };
    });
    
    setTimeout(() => {
        this.state.update(s => ({ ...s, lastMoveStatus: null }));
    }, 2000);
  }
}