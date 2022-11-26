import {Injectable} from '@angular/core';
import * as signalR from '@microsoft/signalr';
import {LogLevel} from '@microsoft/signalr';
import {environment} from '../../../../environments/environment';
import {BehaviorSubject, catchError, defer, filter, finalize, fromEventPattern, map, of, switchMap, tap} from 'rxjs';
import {ZoomService} from './zoom.service';
import {FrameResultMessage, SgAlert, ZoomSession} from './zoom.model';

@Injectable()
export class ZoomHubService {

  private readonly connection = new signalR.HubConnectionBuilder()
    .withUrl(environment.apiUri + '/hub/zoom')
    .configureLogging(LogLevel.Information)
    .withAutomaticReconnect()
    .build();

  private _isConnected = new BehaviorSubject<boolean>(false);
  isConnected$ = this._isConnected.asObservable();

  get isConnected() {
    return this._isConnected.value;
  }

  private _session = new BehaviorSubject<ZoomSession>(null);
  session$ = this._session.asObservable();

  get session() {
    return this._session.value;
  }

  get sessionId() {
    return this.session.sessionId;
  }

  private _connectionId = new BehaviorSubject<string>(null);
  connectionId$ = this._connectionId.asObservable();

  get connectionId() {
    return this._connectionId.value;
  }

  constructor(
    private readonly zoomService: ZoomService
  ) {

  }

  startConnection(sessionIsRestored: boolean = false, restoredSessionId: string = null) {
    return defer(() => this.connection.start())
      .pipe(
        catchError(error => {
          console.log('Error while starting connection: ' + error);

          return error;
        }),
        tap(() => {
          this.connection.onreconnected(this.onReconnected);
        }),
        map(() => {
          console.log('Connection started!');

          const connectionId = this.connection.connectionId;
          this._isConnected.next(true);
          this._connectionId.next(connectionId);

          return connectionId;
        }),
        switchMap(connectionId => {
          if (sessionIsRestored) {
            return this.zoomService.refreshSession(restoredSessionId, connectionId);
          } else {
            return this.zoomService.createSession(connectionId)
          }
        }),
        tap(session => {
          if (sessionIsRestored)
            console.log('Session restored!');
          else
            console.log('Session created!', session);

          this._session.next(session);
        })
      );
  }

  stopConnection() {
    return of(this.isConnected).pipe(
      filter(isConnected => isConnected),
      switchMap(() => defer(() => this.connection.stop())),
      tap(() => {
        console.log('Connection stopped!');
      }),
      catchError(error => {
        console.log('Error while stopping connection: ' + error);

        return error;
      }),
      finalize(() => {
        this._isConnected.next(false);
        this._connectionId.next(null);
      }),
      switchMap(() => this.zoomService.stopSession(this.session.sessionId)),
      tap(() => {
        console.log('Session stopped!');

        this._session.next(null);
      })
    )
  }

  onDetected() {
    return fromEventPattern(
      handler => this.connection.on('Detected', handler),
      handler => this.connection.off('Detected', handler)
    ).pipe(
      map((str: string) => {
        return JSON.parse(str) as FrameResultMessage;
      })
    )
  }

  onAlert() {
    return fromEventPattern(
      handler => this.connection.on('Alert', handler),
      handler => this.connection.off('Alert', handler)
    ).pipe(
      map((obj: any) => {
        return obj as SgAlert;
      })
    )
  }

  onVerified() {
    return fromEventPattern(
      handler => this.connection.on('Verified', handler),
      handler => this.connection.off('Verified', handler)
    ).pipe(
      map((str: string) => {
        return JSON.parse(str) as FrameResultMessage;
      })
    )
  }

  private onReconnected = (connectionId: string) => {
    if (this.session == null)
      return;

    this._connectionId.next(connectionId);
    this.zoomService.refreshSession(this.session.sessionId, connectionId)
      .subscribe(session => {
        console.log('Session refreshed!', session);

        this._session.next(session);
      });
  }

  onAnalyzed() {
    return fromEventPattern(
      handler => this.connection.on('Analysed', handler),
      handler => this.connection.off('Analysed', handler)
    ).pipe(
      map((str: string) => {
        return JSON.parse(str) as FrameResultMessage;
      })
    );
  }
}
