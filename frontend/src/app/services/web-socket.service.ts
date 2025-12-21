import { Injectable } from '@angular/core';
import { RxStomp, RxStompState } from '@stomp/rx-stomp';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
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
    
    // Construction de l'URL pour Spring STOMP raw (nécessite le suffixe /websocket)
    if (wsUrl.startsWith('/')) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      wsUrl = `${protocol}//${host}${wsUrl}/websocket`;
    } 
    else {
      // S'assurer que le protocole est ws/wss
      wsUrl = wsUrl.replace(/^http/, 'ws');
      // S'assurer du suffixe /websocket
      if (!wsUrl.endsWith('/websocket')) {
        wsUrl = wsUrl.replace(/\/$/, '') + '/websocket';
      }
    }

    console.log('WebSocket: Attempting connection to', wsUrl);

    this.rxStomp.configure({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      // Debug pour voir les erreurs de handshake
      debug: (msg: string) => {
        if (msg.includes('ERROR') || msg.includes('Lost connection')) {
          console.error('STOMP Error:', msg);
        }
      }
    });

    this.rxStomp.connectionState$.subscribe(state => {
      console.log('WebSocket: State changed to', RxStompState[state]);
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
