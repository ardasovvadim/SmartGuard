import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DOCUMENT} from '@angular/common';
import {ZoomService} from './services/zoom.service';
import {ZoomHubService} from './services/zoom-hub.service';
import {interval, map, take, tap} from 'rxjs';
import {ZoomMtg} from '@zoomus/websdk';
import {
  AlertCode,
  FrameAttendeeResultMessage,
  FrameResultMessage,
  SgAlert,
  AlertColor,
  SgAttendee,
  ZoomSessionFrame,
  ZoomUser
} from './services/zoom.model';
import {ToolbarCommand} from '../../shared/components/toolbar/toolbar.model';
import * as moment from 'moment/moment';
import {SgTimer} from './services/timer';
import {Router} from '@angular/router';
import {DataStoreService} from '../../services/data-store.service';
import {JoinData, StatisticData} from '../../services/data.model';
import {SgAction, WatcherService} from './services/watcher.service';
import {SgZoomUtils} from './zoom-utils';

@Component({
  selector: 'sg-zoom',
  templateUrl: './zoom.component.html',
  styleUrls: ['./zoom.component.scss'],
  providers: [
    ZoomService,
    ZoomHubService,
    WatcherService
  ]
})
export class ZoomComponent implements OnInit, OnDestroy {

  isConnected$ = this.zoomHubService.isConnected$;
  sessionId$ = this.zoomHubService.session$.pipe(map(session => session?.sessionId));
  connectionId$ = this.zoomHubService.connectionId$;

  _attendees: SgAttendee[] = [];
  private statisticData: StatisticData;

  private storeDetectionData(data: FrameResultMessage) {
    this.statisticData.faceDetectionResults.push(data);
  }

  private storeVerifyData(data: FrameResultMessage) {
    this.statisticData.verificationData.push(data);
  }

  private storeStatisticData(data: FrameResultMessage) {
    this.statisticData.statisticData.push(data);
  }

  private storeAlertData(alert: SgAlert) {
    this.statisticData.alerts.push(alert);
  }

  getAttendees() {
    return this._attendees.filter(a => a.skipped == null || !a.skipped);
  }

  get allAttendees() {
    return this._attendees;
  }

  alerts: SgAlert[] = [];

  private get sessionId() {
    return this.zoomHubService.session?.sessionId;
  }

  private joinData: JoinData;
  private restoredJoinData = false;
  private restoredSessionId: string;

  constructor(
    private readonly httpClient: HttpClient,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly zoomService: ZoomService,
    private readonly zoomHubService: ZoomHubService,
    private readonly dataStore: DataStoreService,
    private readonly router: Router,
    private readonly watcherService: WatcherService
  ) {
    this.tryRestoreSession();
  }

  ngOnInit() {
    SgZoomUtils.initializeZoomSdk();
    this.startZoomSdk();

    this.startSmartGuard();
  }

  private checkErrors(result: FrameResultMessage) {
    const errors = result?.attendees?.filter(a => a.error)?.map(a => a.error);

    if (!errors?.length)
      return;

    for (let error of errors) {
      const alert = {
        text: error,
        color: AlertColor.Red,
        code: AlertCode.Error,
        time: moment().toISOString(),
        frameId: result.frameId
      } as SgAlert;
      this.alerts.unshift(alert);
      this.storeAlertData(alert);
    }
  }

  private notifyResultReceived(infoName: string) {
    this.alerts.unshift({
      text: `${infoName} info updated`,
      time: moment().toISOString(),
      color: AlertColor.None,
      code: AlertCode.Info
    })
  }

  private startEventHandlers() {

    this.zoomHubService.onDetected()
      .pipe(
        tap(this.checkErrors),
        tap(result => this.watcherService.nextRuleData(result, SgAction.FaceDetected)),
        tap(data => this.storeDetectionData(data)),
      )
      .subscribe(result => {
        console.debug('Detected', result);
        if (this.isFaceDetecting || this.oneTimeFrame) {
          this.onFaceDetected(result);

          if (this.oneTimeFrame) {
            this.oneTimeFrame = false;
          }
        }
      });

    this.zoomHubService.onVerified()
      .pipe(
        tap(data => this.checkErrors(data)),
        tap(() => this.notifyResultReceived('Verification')),
        tap(data => this.watcherService.nextRuleData(data, SgAction.FaceVerified)),
        tap(data => this.storeVerifyData(data))
      )
      .subscribe(result => {
        console.log('onVerified', result);
        this.onVerified(result);
        this.redrawFrameBorders();
      });

    this.zoomHubService.onAnalyzed()
      .pipe(
        tap(data => this.checkErrors(data)),
        tap(() => this.notifyResultReceived('Statistic')),
        tap(data => this.storeStatisticData(data))
      )
      .subscribe(result => {
        console.log('onAnalyzed', result);
        this.onAnalyzed(result);
      });

    this.zoomHubService.onAlert()
      .pipe(
        tap(data => this.storeAlertData(data))
      )
      .subscribe(alert => {
        console.log('onAlert', alert);

        const theSameAlert = this.alerts.find(a => a.text == alert.text);

        if (!theSameAlert)
          this.alerts.unshift(alert);
      });
  }

  private onFaceDetected(result?: FrameResultMessage) {
    const containers = SgZoomUtils.getVideoContainersData();

    for (let container of containers) {
      const faces = result?.attendees.find(x => x.userName === container.label)?.faces;
      const rectangles = SgZoomUtils.getFaceRectangles(container.container) ?? [];

      if (!faces || !faces.length) {
        rectangles.forEach(x => x.remove());
        continue;
      }

      if (rectangles.length != faces.length) {
        rectangles.forEach(x => x.remove());
      }

      for (let i = 0; i < faces.length; i++) {
        const rectangle = rectangles[i] || SgZoomUtils.createFaceRectangle(container.container);
        const face = faces[i];
        const x = face[0];
        const y = face[1];
        const w = face[2];
        const h = face[3];
        rectangle.style.left = `${x}px`;
        rectangle.style.top = `${y}px`;
        rectangle.style.width = `${w}px`;
        rectangle.style.height = `${h}px`;

        rectangles.push(rectangle);
      }
    }
  }

  startZoomSdk() {
    SgZoomUtils.startMeeting(
      this.joinData.leaveUrl,
      this.joinData.signature,
      this.joinData.meetingNumber,
      this.joinData.userName,
      this.joinData.sdkKey,
      this.joinData.email,
      this.joinData.passcode,
      () => {
        console.debug('success');
        // @ts-ignore
        window.ZoomMtg = ZoomMtg;
        this.startZoomListeners();
      },
      (error: any) => {
        console.debug('error', error)
      },
    );
  }

  getFrame = () => SgZoomUtils.getFrame()

  toggleGalleryView = () => SgZoomUtils.toggleGalleryView();

  private oneTimeFrame = false;

  sendDetectingFrame() {
    const request = this.getFrameRequest();

    this.oneTimeFrame = true;
    this.zoomService.sendDetectingFrame(this.sessionId, request)
      .subscribe(() => console.log('Detecting frame sent successfully'));
  }

  private getFrameRequest() {
    const frame = this.getFrame();
    const attendees = this.getAttendees().map(x => x.userName);
    const measures = SgZoomUtils.getMeasures().filter(x => attendees.includes(x.userName));

    return {
      content: frame,
      attendees: measures
    } as ZoomSessionFrame;
  }

  private sendVerifyFrame() {
    const request = this.getFrameRequest();

    this.zoomService.sendVerifyingFrame(this.sessionId, request)
      .subscribe(() => console.log('Verifying frame sent successfully'));
  }

  ngOnDestroy(): void {
    this.zoomHubService.stopConnection().subscribe();
  }

  detectingInterval = 1000;
  detectingTimer = new SgTimer(() => this.sendDetectingFrame(), this.detectingInterval);
  get isFaceDetecting() {
    return this.detectingTimer.isRunning;
  }

  toggleFaceDetecting() {
    if (this.isFaceDetecting) {
      this.detectingTimer.stop();
      interval(1000)
        .pipe(
          take(1)
        )
        .subscribe(() => {
          console.log('stop');
          this.clear();
        });
    } else {
      this.detectingTimer.reset();
      this.detectingTimer.start();
    }
  }

  clear() {
    SgZoomUtils.removeAllFaceRectangles();
  }

  dispatchCommand(command: ToolbarCommand) {
    switch (command) {
      case ToolbarCommand.SendDetectFrame:
        this.sendDetectingFrame();
        break;
      case ToolbarCommand.SendVerifyFrame:
        this.sendVerifyFrame();
        break;
      case ToolbarCommand.Clear:
        this.clear();
        break;
      case ToolbarCommand.ToggleGalleryView:
        this.toggleGalleryView();
        break;
      case ToolbarCommand.GetAttendees:
        this.getAttendees();
        break;
      case ToolbarCommand.ToggleFaceDetecting:
        this.toggleFaceDetecting();
        break;
      case ToolbarCommand.ToggleFaceVerifying:
        this.toggleFaceVerifying();
        break;
      case ToolbarCommand.ToggleStatistic:
        this.toggleStatistic();
        break;
      case ToolbarCommand.SendStatisticFrame:
        this.sendStatisticFrame();
        break;
    }
  }

  private onUserJoined(user: ZoomUser) {
    let attendee = this._attendees.find(x => x.userName === user.userName);

    if (!attendee) {
      attendee = user as SgAttendee;

      attendee.joinedTimes = [];
      attendee.leftTimes = [];
      attendee.joinedTime = moment().toISOString();
      attendee.joinedTimes.push(attendee.joinedTime);
      this._attendees.push(attendee);
    }

    attendee.active = true;
  }

  private startZoomListeners() {
    ZoomMtg.getAttendeeslist({
      success: (response) => {
        const users = response?.result?.attendeesList as ZoomUser[] ?? [];
        for (let user of users) {
          this.onUserJoined(user);
        }

        ZoomMtg.getCurrentUser({
          success: (response: any) => {
            const currentUser = response?.result?.currentUser as ZoomUser;

            if (!currentUser)
              return;

            const att = this._attendees.find(x => x.userName === currentUser.userName);
            if (att)
              att.skipped = true;
          }
        });
      }
    });

    ZoomMtg.inMeetingServiceListener('onUserJoin', (user: ZoomUser) => {
      this.onUserJoined(user);
    });

    ZoomMtg.inMeetingServiceListener('onUserLeave', (user: ZoomUser) => {
      const attendee = this._attendees.find(x => x.userName === user.userName);

      if (attendee) {
        attendee.active = false;
        attendee.leftTime = moment().toISOString();
        attendee.leftTimes.push(attendee.leftTime);
      }
    });
  }

  private startSmartGuard() {
    this.zoomHubService.startConnection(this.restoredJoinData, this.restoredSessionId)
      .pipe(
        tap(() => this.startEventHandlers()),
        tap(() => this.storeSession(this.restoredSessionId)),
        tap(() => this.startRules()),
        tap(() => {
          this.statisticData = this.dataStore.getStatisticData(this.joinData, this.sessionId, this.restoredJoinData);
          new SgTimer(() => {
            this.dataStore.saveStatisticData(this.statisticData);
            console.log('Statistic data saved');
          }, 5 * 1000).start();
        })
      )
      .subscribe();
  }

  verifyInterval = 30 * 1000;
  verifyTimer: SgTimer = new SgTimer(() => this.sendVerifyFrame(), this.verifyInterval);
  get isFaceVerifying() {
    return this.verifyTimer.isRunning;
  }

  private toggleFaceVerifying() {
    if (this.isFaceVerifying) {
      this.verifyTimer.stop();
    } else {
      this.verifyTimer.reset();
      this.verifyTimer.start();
    }
  }

  private onVerified(result: FrameResultMessage) {
    for (let attendee of this.getAttendees()) {
      if (!attendee.active)
        continue;

      const verifyingInfo = result.attendees.find(x => x.userName === attendee.userName)?.verifyingInfo;

      attendee.lastVerifiedTime = moment().toISOString();
      attendee.lastVerified = attendee.verified;

      if (!verifyingInfo || !verifyingInfo.verified) {
        attendee.verified = false;
        continue;
      }

      attendee.verified = true;
    }

    for (let attendee of this.getAttendees()) {
      if (attendee.lastVerified != attendee.verified) {
        const alert = {
          text: `${attendee.userName} is ${attendee.verified ? 'verified' : 'unverified'}`,
          time: moment().toISOString(),
          code: attendee.verified ? AlertCode.AttendeeVerified : AlertCode.AttendeeNotVerified,
          color: attendee.verified ? AlertColor.Green : AlertColor.Yellow,
          frameId: result.frameId
        } as SgAlert;
        this.storeAlertData(alert);
        this.alerts.unshift(alert);
      }
    }
  }

  statisticInterval = 30 * 1000;
  statisticTimer: SgTimer = new SgTimer(() => this.sendStatisticFrame(), this.statisticInterval);
  get isStatistic() {
    return this.statisticTimer.isRunning;
  }

  private toggleStatistic() {
    if (this.isStatistic) {
      this.statisticTimer.stop();
    } else {
      this.statisticTimer.reset();
      this.statisticTimer.start();
    }
  }

  private getStatisticActions(): string[] {
    const actions = [];
    const settings = this.joinData.settings;
    debugger;

    if (!settings)
      return actions;

    if (settings.emotion)
      actions.push('emotion');

    if (settings.age)
      actions.push('age');

    if (settings.genre)
      actions.push('genre');

    if (settings.race)
      actions.push('race');

    return actions;
  }

  private sendStatisticFrame() {
    const request = this.getFrameRequest();
    request.actions = this.getStatisticActions();

    this.zoomService.sendStatisticFrame(this.sessionId, request)
      .subscribe(() => console.log('Statistic frame sent successfully'));
  }

  private onAnalyzed(result: FrameResultMessage) {
    const atts = result.attendees;

    if (!atts?.length)
      return;

    for (let attendee of this.getAttendees()) {
      const statisticInfo = atts.find(a => a.userName == attendee.userName)?.statisticInfo;

      if (!statisticInfo)
        continue;

      attendee.emotion = statisticInfo.dominant_emotion;
      attendee.age = statisticInfo.age;
      attendee.race = statisticInfo.dominant_race;
      attendee.gender = statisticInfo.gender;
      attendee.lastStatisticUpdated = moment().toISOString();
    }
  }

  private storeSession(sessionId: string) {
    if (sessionId)
      return;

    this.dataStore.storeJoinDataBySessionId(this.sessionId, this.joinData);
    this.router.navigate([], { queryParams: { sessionId: this.sessionId }, queryParamsHandling: 'merge' });
  }

  private tryRestoreSession() {
    const sessionId = this.dataStore.getSessionIdFromQuery();

    if (!sessionId) {
      this.joinData = this.dataStore.getJoinData();
      return;
    }

    const joinData = this.dataStore.getJoinDataBySessionId(sessionId)
    if (!joinData) {
      this.joinData = this.dataStore.getJoinData();
      return;
    }

    this.joinData = joinData;
    this.restoredJoinData = true;
    this.restoredSessionId = sessionId;
  }

  private startRules() {
    this.watcherService.startRuleHandler(this._attendees)
      .subscribe(alerts => {
        for (let result of alerts) {
          switch (result.code) {
            case AlertCode.MultiplePersonsDetected: {
              const release: FrameAttendeeResultMessage[] = result.data.release ?? [];
              const report: FrameAttendeeResultMessage[] = result.data.report ?? [];
              this.getAttendees().filter(x => release.some(y => y.userName === x.userName)).forEach(x => x.multiplePersonDetected = false);
              this.getAttendees().filter(x => report.some(y => y.userName === x.userName)).forEach(x => x.multiplePersonDetected = true);

              if (report.length) {
                this.storeAlertData(result);
                this.alerts.unshift(result);
              }

              this.redrawFrameBorders();
              break;
            }
            case AlertCode.PersonIsNotPresentDetected: {
              const release: FrameAttendeeResultMessage[] = result.data.release ?? [];
              const report: FrameAttendeeResultMessage[] = result.data.report ?? [];
              this.getAttendees().filter(x => release.some(y => y.userName === x.userName)).forEach(x => x.personIsNotDetected = false);
              this.getAttendees().filter(x => report.some(y => y.userName === x.userName)).forEach(x => x.personIsNotDetected = true);

              if (report.length) {
                this.storeAlertData(result);
                this.alerts.unshift(result);
              }

              this.redrawFrameBorders();
              break;
            }
          }
        }
      })
    ;
  }

  private redrawFrameBorders() {
    if (!this._attendees.length)
      return;

    const attendeeColors = [];

    for (let attendee of this._attendees) {
      const grey = (attendee.skipped ?? false);
      if (grey) {
        attendeeColors.push({
          attendee,
          color: AlertColor.Grey
        });
        continue;
      }

      const red = (attendee.personIsNotDetected ?? false)
        || (attendee.multiplePersonDetected ?? false)
        || (attendee.verified != null && !attendee.verified)
      if (red) {
        attendeeColors.push({
          attendee,
          color: AlertColor.Red
        });
        continue;
      }

      const yellow = false;
      if (yellow) {
        attendeeColors.push({
          attendee,
          color: AlertColor.Yellow
        });
        continue;
      }

      const green = attendee.verified ?? false;
      if (green) {
        attendeeColors.push({
          attendee,
          color: AlertColor.Green
        });
        continue;
      }

      attendeeColors.push({
        attendee,
        color: AlertColor.None
      });
    }

    const containers = SgZoomUtils.getVideoContainersData();
    for (let container of containers) {
      const attendee = attendeeColors.find(x => x.attendee.userName == container.label);
      SgZoomUtils.markContainer(container, attendee.color);
    }
  }
}
