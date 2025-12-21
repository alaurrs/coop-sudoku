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
  
  public connectionState$ = new BehaviorSubject<RxStompState>(RxStompState.CLOSED);

  constructor() {
    this.rxStomp = new RxStomp();
    
    let wsUrl = environment.wsUrl;
    if (wsUrl.startsWith('/')) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      wsUrl = `${protocol}//${host}${wsUrl}/websocket`;
    } else if (wsUrl.startsWith('http')) {
      wsUrl = wsUrl.replace('http', 'ws') + '/websocket';
    }

    this.rxStomp.configure({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.rxStomp.connectionState$.subscribe(state => {
      this.connectionState$.next(state);
    });

    this.rxStomp.activate();
  }

  watchTopic(topic: string): Observable<any> {
    return this.rxStomp.watch(topic).pipe(
      map(message => JSON.parse(message.body))
    );
  }

  send(destination: string, body: any) {
    this.rxStomp.publish({ 
      destination, 
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' }
    });
  }
}
