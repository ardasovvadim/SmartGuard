import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FinishRoutingModule } from './finish-routing.module';
import { FinishComponent } from './finish.component';


@NgModule({
  declarations: [
    FinishComponent
  ],
  imports: [
    CommonModule,
    FinishRoutingModule
  ]
})
export class FinishModule { }
