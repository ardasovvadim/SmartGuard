import {Component, Input} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'sg-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {

  @Input() faceDetectingInterval: number = 1000;
  @Input() faceVerifyingInterval: number = 30;
  @Input() statisticInterval: number = 30;

  form: FormGroup = this.fb.group({
    verification: [true],
    faceDetecting: [true],
    faceRecognition: [true],
    localRecording: [true],
    statistic: [true],
    emotion: [true],
    age: [true],
    genre: [true],
    race: [true],
    shouldBeOnePerson: [true],
    attendance: [true],
    cameraShouldBeEnabled: [true],
  });

  getSettings(): SgSettings {
    const value = this.form.value;
    value.faceDetectingInterval = this.faceDetectingInterval;
    value.faceVerifyingInterval = this.faceVerifyingInterval;
    value.statisticInterval = this.statisticInterval;
    return value as SgSettings;
  }

  constructor(
    private readonly fb: FormBuilder
  ) {
  }

}

export interface SgSettings {
  verification: boolean;
  faceDetecting: boolean;
  faceRecognition: boolean;
  localRecording: boolean;
  statistic: boolean;
  emotion: boolean;
  age: boolean;
  genre: boolean;
  race: boolean;
  shouldBeOnePerson: boolean;
  attendance: boolean;
  cameraShouldBeEnabled: boolean;
  faceDetectingInterval: number;
  faceVerifyingInterval: number;
  statisticInterval: number;
}
