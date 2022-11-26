import { Injectable } from '@angular/core';
import {catchError, defer, fromEventPattern, tap} from 'rxjs';
import * as signalR from '@microsoft/signalr';
import {environment} from '../../../environments/environment';
import {LogLevel} from '@microsoft/signalr';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class MqTestHubService {

  private readonly baseUrl = environment.apiUri + '/api/zoom';

  private readonly connection = new signalR.HubConnectionBuilder()
    .withUrl(environment.apiUri + "/hub/zoom")
    .configureLogging(LogLevel.Information)
    .withAutomaticReconnect()
    .build();

  constructor(
    private readonly httpClient: HttpClient,
  ) { }

  startConnection() {
    return defer(() => this.connection.start())
      .pipe(
        tap(() => {
          console.log('Connection started!');
        }),
        catchError(error => {
          console.log('Error while starting connection: ' + error);
          return error;
        })
      )
  }

  stopConnection() {
    return defer(() => this.connection.stop())
      .pipe(
        tap(() => {
          console.log('Connection stopped!');
        }),
        catchError(error => {
          console.log('Error while stopping connection: ' + error);
          return error;
        })
      )
  }

  onReceiveMessage() {
    return fromEventPattern(
      handler => this.connection.on('ReceiveMessage', handler),
      handler => this.connection.off('ReceiveMessage', handler),
    )
  }

  mqTest(message: string) {
    return this.httpClient.post<void>(this.baseUrl + '/mq-test', {message})
  }

}
