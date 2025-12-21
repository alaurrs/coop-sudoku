import { Injectable } from '@angular/core';
import { RxStomp, RxStompState } from '@stomp/rx-stomp';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { GameEvent } from '../models/game.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private rxStomp: RxStomp;
  private gameEventsSubject = new Subject<GameEvent>();
  public gameEvents$ = this.gameEventsSubject.asObservable();
  
  public connectionState$ = new BehaviorSubject<RxStompState>(RxStompState.CLOSED);

  constructor() {
    this.rxStomp = new RxStomp();
    
    // Construct full WebSocket URL if it's relative
    let wsUrl = environment.wsUrl;
    if (wsUrl.startsWith('/')) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      wsUrl = `${protocol}//${host}${wsUrl}/websocket`;
    }

    this.rxStomp.configure({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      // debug: (msg: string) => console.log('STOMP DEBUG:', msg)
    });

    this.rxStomp.connectionState$.subscribe(state => {
      console.log('WS Connection State:', RxStompState[state]);
      this.connectionState$.next(state);
    });

    this.rxStomp.activate();
  }

  connectToGame(roomId: string) {
    console.log(`WS: Attempting subscription to /topic/game/${roomId}`);
    
    this.rxStomp.watch(`/topic/game/${roomId}`).subscribe({
      next: (message) => {
        console.log('WS: Raw Message Received:', message.body);
        try {
          const event = JSON.parse(message.body) as GameEvent;
          console.log('WS: Parsed Event:', event.type);
          this.gameEventsSubject.next(event);
        } catch (e) {
          console.error('WS: Error parsing message body', e);
        }
      },
      error: (err) => console.error(`WS: Error watching topic for room ${roomId}`, err)
    });
  }

  send(destination: string, body: any) {
    console.log(`WS: Publishing to ${destination}`, body);
    this.rxStomp.publish({ 
      destination, 
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' }
    });
  }
}