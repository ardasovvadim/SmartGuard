import {UiMeasureData} from '../zoom-utils';

export interface ZoomSignature {
  signature: string;
}

export interface ZoomSession {
  sessionId: string;
  connectionId: string;
  createdTime: string;
  updatedTime: string;
}

export interface ZoomSessionFrame {
  content: string;
  attendees: ZoomSessionAttendeeFrame[];
  actions?: string[];
}

export interface ZoomSessionAttendeeFrame extends UiMeasureData {
}


export interface FrameResultMessage {
  sessionId: string;
  frameId?: string;
  attendees: FrameAttendeeResultMessage[];
}

export interface FrameAttendeeResultMessage extends UiMeasureData {
  faces?: number[][];
  verifyingInfo?: VerifyingInfo;
  statisticInfo?: StatisticInfo;
  error?: string;
}

export interface StatisticInfo {
  emotion: {
    angry: number,
    disgust: number,
    fear: number,
    happy: number,
    sad: number,
    surprise: number,
    neutral: number
  },
  dominant_emotion: string,
  age: number,
  gender: string,
  race: {
    asian: number,
    indian: number,
    black: number,
    white: number,
    'middle eastern': number,
    'latino hispanic': number
  },
  'dominant_race': 'white'
}

export interface VerifyingInfo {
  verified: boolean,
  distance: number,
  threshold: number,
  model: string,
  detector_backend: string,
  similarity_metric: string
}

export interface ZoomUser {
  userId: number,
  userName: string,
  muted: boolean,
  audio?: string,
  isHost: boolean,
  isCoHost: string,
  isGuest: boolean,
  isHold: boolean,
  persistentID: string
}

export interface SgAttendee extends ZoomUser {
  verified?: boolean;
  lastVerified?: boolean;
  lastVerifiedTime?: string;

  emotion?: string;
  age?: number;
  gender?: string;
  race?: string;

  skipped?: boolean;

  multiplePersonDetected?: boolean;
  personIsNotDetected?: boolean;

  lastStatisticUpdated?: string;
  active?: boolean;
  joinedTime?: string;
  joinedTimes: string[];
  leftTime?: string;
  leftTimes?: string[];
}


export interface SgAlert {
  text: string;
  color: AlertColor;
  code: AlertCode;
  data?: any;
  time: string;
  frameId?: string;
}

export enum AlertCode {
  None = 0,
  MissedUserData,
  AttendeeNotVerified,
  AttendeeVerified,
  Error,
  Info,
  MultiplePersonsDetected,
  PersonIsNotPresentDetected,
}


export enum AlertColor {
  None = 0,
  Red,
  Yellow,
  Green,
  Grey
}
