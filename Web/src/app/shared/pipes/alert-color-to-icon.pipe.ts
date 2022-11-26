import {Pipe, PipeTransform} from '@angular/core';
import {AlertColor} from '../../pages/zoom/services/zoom.model';

@Pipe({
  name: 'alertColorToIcon'
})
export class AlertColorToIconPipe implements PipeTransform {

  transform(value: AlertColor): string {
    switch (value) {
      case AlertColor.Green:
        return '🟢';
      case AlertColor.Yellow:
        return '⚠️';
      case AlertColor.Red:
        return '❗';
      default:
        return '';
    }
  }

}
