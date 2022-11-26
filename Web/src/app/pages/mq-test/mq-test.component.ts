import {Component, OnDestroy, OnInit} from '@angular/core';
import {ZoomService} from '../zoom/services/zoom.service';
import {switchMap} from 'rxjs';
import {MqTestHubService} from './mq-test-hub.service';

@Component({
  selector: 'sg-mq-test',
  templateUrl: './mq-test.component.html',
  styleUrls: ['./mq-test.component.scss'],
  providers: [
    MqTestHubService
  ]
})
export class MqTestComponent implements OnInit, OnDestroy {

  testMessage = '';
  messages: string[] = [];

  constructor(
    private readonly mqTestHubService: MqTestHubService
  ) {
  }

  ngOnInit(): void {
    this.mqTestHubService.startConnection()
      .pipe(
        switchMap(() => this.mqTestHubService.onReceiveMessage())
      )
      .subscribe((message: any) => {
        this.messages.push(message);
      });
  }

  sendTestMqMessage() {
    this.mqTestHubService
      .mqTest(this.testMessage)
      .subscribe(() => console.log('message sent'));
  }

  ngOnDestroy(): void {
    this.mqTestHubService.stopConnection()
      .subscribe();
  }
}
