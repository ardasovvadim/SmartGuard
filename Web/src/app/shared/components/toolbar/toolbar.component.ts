import {Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';
import {ToolbarCommand} from './toolbar.model';
import {SgAlert, SgAttendee} from '../../../pages/zoom/services/zoom.model';

@Component({
  selector: 'sg-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ToolbarComponent {

  @Input() isConnected: boolean;
  @Input() sessionId: string;
  @Input() connectionId: string;
  @Input() isFaceDetecting: boolean;
  @Input() isToolbarOpen: boolean = true;
  @Input() alertPanel: boolean = false;
  @Input() attendeePanelHidden: boolean = false;
  @Input() displayAttendeeExtraInfo: boolean = true;
  @Input() settingsHidden: boolean = true;
  @Input() isFaceVerifying: boolean = false;
  @Input() detectingTime: number = 0;
  @Input() verifyingTime: number = 0;
  @Input() statisticTime: number = 0;
  @Input() isStatistic: boolean = false;
  @Input() attendees: SgAttendee[] = [];
  @Input() alerts: SgAlert[] = [];
  @Input() faceDetectingInterval: number = 250;
  @Input() faceVerifyingInterval: number = 30;
  @Input() statisticInterval: number = 30;

  isStartIconHidden: boolean = this.isToolbarOpen;

  @Output() onClick: EventEmitter<ToolbarCommand> = new EventEmitter<ToolbarCommand>;


  click(command: string) {
    this.onClick.emit(ToolbarCommand[command]);
  }

  toggleAlertsPanel() {
    this.alertPanel = !this.alertPanel;
  }

  toggleAttendeePanel() {
    this.attendeePanelHidden = !this.attendeePanelHidden;
  }

  onToolboxHiddenChanged(hidden: boolean) {
    this.isStartIconHidden = !hidden;
  }
}
