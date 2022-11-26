import {Component} from '@angular/core';
import {StatisticUtils} from './statisticUtils';
import {AlertColor, FrameResultMessage, SgAlert} from '../zoom/services/zoom.model';
import * as moment from 'moment';
import {DataStoreService} from '../../services/data-store.service';
import {StatisticData} from '../../services/data.model';
import {unitOfTime} from 'moment';
import {environment} from '../../../environments/environment';

StatisticUtils.loadExternalStyles('uikit-css.css');
StatisticUtils.loadExternalScript('uikit-js.js');
StatisticUtils.loadExternalScript('uikit-icons-js.js');

@Component({
  selector: 'sg-statistic',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.scss']
})
export class StatisticComponent {

  tab: StatisticTab = StatisticTab.EventsTimeline;
  statistic: StatisticData;

  alerts: SgAlert[] = [];

  timeDelta = 10;
  timeUnit: unitOfTime.Diff = 'second';
  sessionId: string;

  constructor(
    private readonly dataStore: DataStoreService
  ) {
    this.statistic = dataStore.getStatistic();
    if (this.statistic) {
      this.alerts = this.statistic.alerts;

      this.sessionId = this.statistic.sessionId;
      // this.emotionsStatistic = this.calculateEmotionsStatistic(this.statistic.statisticData);
    }
  }

  get minAlertTime(): string {
    const dates = this.alerts.map(a => moment(a.time))
    return moment.min(dates).toISOString();
  }

  get minAlertTimeAsStr(): string {
    return moment(this.minAlertTime).format('HH:mm:ss');
  }

  get maxAlertTime(): string {
    const dates = this.alerts.map(a => moment(a.time))
    return moment.max(dates).toISOString();
  }

  get maxAlertTimeAsStr(): string {
    return moment(this.maxAlertTime).format('HH:mm:ss');
  }


  get alertTimeSlots(): string[] {
    const min = moment(this.minAlertTime);
    const max = moment(this.maxAlertTime);
    const diff = max.diff(min, this.timeUnit) / this.timeDelta;
    const slots = [];
    slots.push(min.toISOString());
    for (let i = 0; i < diff; i++) {
      slots.push(min.add(this.timeDelta, this.timeUnit).toISOString());
    }
    return slots;
  }

  alertInTimeSlot(fromTime: string): SgAlert[] {
    const min = moment(fromTime);
    const max = moment(fromTime).add(10, this.timeUnit);
    return this.alerts.filter(a => {
      const alertTime = moment(a.time);
      return alertTime.isBetween(min, max, 'seconds', '[)');
    });
  }

  getCountAlertsByColorsInTimeSlot(fromTime: string): {name: string, color: AlertColor, class: string, value: number}[] {
    const alerts = this.alertInTimeSlot(fromTime);
    const colors = [
      AlertColor.Red,
      AlertColor.Yellow,
      AlertColor.Green
    ];
    const result = [
      {
        name: 'Red',
        class: 'sg-alert-red',
        color: AlertColor.Red,
        value: alerts.filter(a => a.color === AlertColor.Red).length
      },
      {
        name: 'Yellow',
        class: 'sg-alert-yellow',
        color: AlertColor.Yellow,
        value: alerts.filter(a => a.color === AlertColor.Yellow).length
      },
      {
        name: 'Green',
        class: 'sg-alert-green',
        color: AlertColor.Green,
        value: alerts.filter(a => a.color === AlertColor.Green).length
      },
      {
        name: 'Other',
        class: 'sg-alert-other',
        color: AlertColor.None,
        value: alerts.filter(a => !colors.includes(a.color)).length
      }
    ]
    return result.filter(r => r.value > 0);
  }

  formatDate = (date: string) => moment(date).format('HH:mm');

  selectedTimeSlot: string;
  alertsFromSelectedTimeSlot: SgAlert[] = [];

  selectTimeSlot(timeSlot: string) {
    this.selectedTimeSlot = timeSlot;
    const from = moment(timeSlot);
    const to = moment(timeSlot).add(this.timeDelta, this.timeUnit);
    const selectedAlerts = this.alerts.filter(a => {
      const alertTime = moment(a.time);
      return alertTime.isBetween(from, to, 'seconds', '[)');
    });
    this.alertsFromSelectedTimeSlot = selectedAlerts ?? [];
    this.selectedAlert = null;
  }

  private calculateEmotionsStatistic(data: FrameResultMessage[]) {
    if (!data || data.length === 0) {
      return [];
    }

    return [];
  }

  selectedAlert: SgAlert;

  selectAlert(alert: SgAlert) {
    this.selectedAlert = alert;
  }

  getFramePath(frameId: string) {
    return environment.apiUri + '/api/statistic/' + this.sessionId + '/' + frameId;
  }

  emotionsStatistic = [
    {
      "name": "happy",
      "series": [
        {
          "value": 10,
          "name": "2022-11-26T10:00:00.000Z"
        },
        {
          "value": 6,
          "name": "2022-11-26T10:30:00.000Z"
        },
        {
          "value": 7,
          "name": "2022-11-26T11:00:00.000Z"
        },
        {
          "value": 5,
          "name": "2022-11-26T11:30:00.000Z"
        },
      ]
    },
    {
      "name": "neutral",
      "series": [
        {
          "value": 3,
          "name": "2022-11-26T10:00:00.000Z"
        },
        {
          "value": 5,
          "name": "2022-11-26T10:30:00.000Z"
        },
        {
          "value": 8,
          "name": "2022-11-26T11:00:00.000Z"
        },
        {
          "value": 7,
          "name": "2022-11-26T11:30:00.000Z"
        },
      ]
    },
  ];
}

export enum StatisticTab {
  None = 0,
  AlertsList,
  EmotionsChart,
  EventsTimeline,
}
