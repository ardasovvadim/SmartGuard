import {NgModule} from '@angular/core';

import {StatisticRoutingModule} from './statistic-routing.module';
import {StatisticComponent} from './statistic.component';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import {SharedModule} from '../../shared/shared.module';
import { AlertCountAsColorClassPipe } from './pipes/alert-count-as-color-class.pipe';


@NgModule({
  declarations: [
    StatisticComponent,
    AlertCountAsColorClassPipe
  ],
  imports: [
    NgxChartsModule,
    StatisticRoutingModule,
    SharedModule,
  ]
})
export class StatisticModule { }
