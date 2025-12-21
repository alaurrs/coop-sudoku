export interface GameSession {
  roomId: string;
  currentGrid: number[][];
  solution: number[][];
  players: string[];
  state: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  startTime: number;
  difficulty: string;
}

export interface GameSummary {
  roomId: string;
  hostId: string;
  difficulty: string;
  state: string;
  playerCount: number;
  createdAt: number;
}

export interface Suggestion {
  suggesterId: string;
  row: number;
  col: number;
  value: number;
}

export interface MoveResult {
  row: number;
  col: number;
  value: number;
  isCorrect: boolean;
  isWin: boolean;
}

export interface GameEvent {
  type: string;
  payload: any;
}