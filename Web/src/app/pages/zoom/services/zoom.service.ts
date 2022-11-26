import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ZoomSession, ZoomSessionFrame, ZoomSignature} from './zoom.model';

@Injectable()
export class ZoomService {

  private readonly baseUrl = environment.apiUri + '/api/zoom';

  constructor(
    private readonly httpClient: HttpClient,
  ) {
  }

  getSignature(meetingNumber: string, role: number) {
    const param = new HttpParams()
      .set('meetingNumber', meetingNumber)
      .set('role', role.toString())
    ;
    return this.httpClient.get<ZoomSignature>(this.baseUrl + '/signature', {
      params: param
    });
  }

  createSession(connectionId: string) {
    return this.httpClient.post<ZoomSession>(this.baseUrl + '/session', {connectionId});
  }

  refreshSession(sessionId: string, connectionId: string) {
    return this.httpClient.post<ZoomSession>(this.baseUrl + '/session/' + sessionId + '/refresh', {connectionId});
  }

  stopSession(sessionId: string) {
    return this.httpClient.delete<void>(this.baseUrl + '/session/' + sessionId);
  }

  sendDetectingFrame(sessionId: string, request: ZoomSessionFrame) {
    return this.httpClient.post<void>(this.baseUrl + '/session/' + sessionId + '/detecting-frame', request);
  }

  sendVerifyingFrame(sessionId: string, request: ZoomSessionFrame) {
    return this.httpClient.post<void>(this.baseUrl + '/session/' + sessionId + '/verifying-frame', request);
  }

  sendStatisticFrame(sessionId: string, request: ZoomSessionFrame) {
    return this.httpClient.post<void>(this.baseUrl + '/session/' + sessionId + '/analysing-frame', request);
  }
}
