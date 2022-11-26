import {Injectable} from '@angular/core';
import {
  AlertCode,
  FrameAttendeeResultMessage,
  FrameResultMessage,
  SgAlert,
  AlertColor,
  SgAttendee
} from './zoom.model';
import {filter, map, Subject, takeUntil} from 'rxjs';
import * as moment from 'moment';

@Injectable()
export class WatcherService {

  constructor() {}

  private _ruleQueue: Subject<RuleData> = new Subject<RuleData>()
  private _stopRules = new Subject();
  private _attendees: SgAttendee[] = [];

  nextRuleData(result: FrameResultMessage, rule: SgAction) {
    this._ruleQueue.next({data: result, action: rule});
  }

  startRuleHandler(attendees: SgAttendee[]) {
    this._attendees = attendees;

    return this._ruleQueue.asObservable()
      .pipe(
        takeUntil(this._stopRules),
        map(data => this.processRule(data)),
        filter(a => !!a)
      );
  }

  private processRule(data: RuleData): SgAlert[] {
    const alerts = [];
    let alert: SgAlert = null;

    switch (data.action) {
      case SgAction.FaceDetected: {
        alert = this.handleMultiplePersons(data.data);
        if (alert)
          alerts.push(alert);

        alert = this.handlePersonIsNotPresent(data.data);
        if (alert)
          alerts.push(alert);

        break;
      }
      case SgAction.FaceVerified: {
      }
    }

    return alerts;
  }

  private _lastMultiplePersonsAlert: FrameAttendeeResultMessage[] = [];

  private handleMultiplePersons(data: FrameResultMessage): SgAlert {
    let attendees = data.attendees.filter(a => a.faces && a.faces.length > 1);

    if (!attendees.length) {
      const resultAlert = {
        text: null,
        code: AlertCode.MultiplePersonsDetected,
        data: {
          release: this._lastMultiplePersonsAlert
        },
        color: AlertColor.Green,
        time: moment().toISOString(),
        frameId: data.frameId
      } as SgAlert;
      this._lastMultiplePersonsAlert = [];

      return resultAlert;
    }

    const attendeeToRelease = this._lastMultiplePersonsAlert.filter(a => !attendees.find(b => b.userName === a.userName));
    const attendeeToReport = attendees.filter(a => !this._lastMultiplePersonsAlert.find(b => b.userName === a.userName));
    this._lastMultiplePersonsAlert = this._lastMultiplePersonsAlert
      .filter(a => !attendeeToRelease.find(b => b.userName === a.userName))
      .concat(attendeeToReport)
    ;

    return {
      text: 'Multiple persons detected. Attendees: ' + attendeeToReport.map(a => a.userName).join(', '),
      code: AlertCode.MultiplePersonsDetected,
      data: {
        report: attendeeToReport,
        release: attendeeToRelease
      },
      color: AlertColor.Red,
      time: moment().toISOString(),
      frameId: data.frameId
    } as SgAlert;
  }


  private handleCameraShouldBeOn(data: FrameResultMessage): SgAlert {
    return null;
  }

  private _lastPersonIsNotPresentAlert: FrameAttendeeResultMessage[] = [];

  private handlePersonIsNotPresent(data: FrameResultMessage): SgAlert {
    const result = data.attendees.filter(a => (!a.faces && !a.error) || a.faces?.length === 0);

    if (!result.length) {
      const resultAlert = {
        text: null,
        code: AlertCode.PersonIsNotPresentDetected,
        data: {
          release: this._lastPersonIsNotPresentAlert
        },
        color: AlertColor.Green,
        time: moment().toISOString(),
        frameId: data.frameId
      };
      this._lastPersonIsNotPresentAlert = [];

      return resultAlert;
    }

    const attendeeToRelease = this._lastPersonIsNotPresentAlert.filter(a => !result.find(b => b.userName === a.userName));
    const attendeeToReport = result.filter(a => !this._lastPersonIsNotPresentAlert.find(b => b.userName === a.userName));
    this._lastPersonIsNotPresentAlert = this._lastPersonIsNotPresentAlert
      .filter(a => !attendeeToRelease.find(b => b.userName === a.userName))
      .concat(attendeeToReport)
    ;

    return {
      text: 'Person is not detected on camera. Attendees: ' + attendeeToReport.map(a => a.userName).join(', '),
      code: AlertCode.PersonIsNotPresentDetected,
      data: {
        release: attendeeToRelease,
        report: attendeeToReport
      },
      color: AlertColor.Red,
      time: moment().toISOString(),
      frameId: data.frameId
    } as SgAlert;
  }
}

export interface RuleData {
  action: SgAction;
  data: FrameResultMessage;
}

export enum SgAction {
  None = 0,
  FaceDetected,
  FaceVerified,
}
