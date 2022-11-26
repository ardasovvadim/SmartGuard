import { Pipe, PipeTransform } from '@angular/core';
import {AlertCode} from '../../pages/zoom/services/zoom.model';

@Pipe({
  name: 'alertCodeToText'
})
export class AlertCodeToTextPipe implements PipeTransform {

  transform(value: AlertCode): string {
    switch (value) {
      case AlertCode.MissedUserData:
        return 'Missed user data';
      case AlertCode.PersonIsNotPresentDetected:
        return 'Person is not detected';
      case AlertCode.Info:
        return 'Info';
      case AlertCode.Error:
        return 'Error';
      case AlertCode.AttendeeNotVerified:
        return 'Attendee not verified';
      case AlertCode.AttendeeVerified:
        return 'Attendee verified';
      case AlertCode.MultiplePersonsDetected:
        return 'Multiple persons detected';
      default:
        return '';
    }
  }

}
