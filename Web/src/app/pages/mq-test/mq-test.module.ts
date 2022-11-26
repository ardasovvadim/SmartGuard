import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MqTestRoutingModule } from './mq-test-routing.module';
import { MqTestComponent } from './mq-test.component';
import {SharedModule} from '../../shared/shared.module';


@NgModule({
  declarations: [
    MqTestComponent
  ],
  imports: [
    CommonModule,
    MqTestRoutingModule,
    SharedModule
  ]
})
export class MqTestModule { }
