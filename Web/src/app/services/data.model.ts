import {FrameResultMessage, SgAlert} from '../pages/zoom/services/zoom.model';
import {SgSettings} from '../shared/components/settings/settings.component';

export interface JoinData {
  userName: string;
  email: string;
  meetingNumber: string;
  passcode: string;
  signature: string;
  sdkKey: string;
  leaveUrl: string;
  settings: SgSettings;
}

export interface StatisticData extends JoinData {
  sessionId: string;

  faceDetectionResults: FrameResultMessage[];
  statisticData: FrameResultMessage[];
  verificationData: FrameResultMessage[];
  alerts: SgAlert[];
}
