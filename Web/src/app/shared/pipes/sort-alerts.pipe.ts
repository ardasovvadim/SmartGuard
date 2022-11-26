import { Pipe, PipeTransform } from '@angular/core';
import {SgAlert} from '../../pages/zoom/services/zoom.model';
import * as moment from 'moment';

@Pipe({
  name: 'sortAlerts'
})
export class SortAlertsPipe implements PipeTransform {

  transform(value: SgAlert[]): SgAlert[] {
    return value.sort((a, b) => {
      const aDate = moment(a.time);
      const bDate = moment(b.time);
      const result = aDate.isAfter(bDate, 'seconds') ? -1 : 1;
      return result;
    });
  }

}
