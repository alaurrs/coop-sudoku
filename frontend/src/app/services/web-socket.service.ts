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
    
    // Simplification radicale : on force le chemin correct sans essayer d'être trop intelligent
    // Si c'est une URL complète (cas normal en prod), on remplace juste le protocole et on ajoute /websocket
    if (wsUrl.startsWith('http')) {
      wsUrl = wsUrl.replace(/^http/, 'ws');
    }
    
    // Si l'URL contient déjà /api/ws-sudoku, on ne touche à rien, sinon on s'assure du bon format
    if (!wsUrl.endsWith('/websocket')) {
       wsUrl = wsUrl.replace(/\/+$/, '') + '/websocket';
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
