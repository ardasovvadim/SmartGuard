import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JoinRoutingModule } from './join-routing.module';
import { JoinComponent } from './join.component';
import {SharedModule} from '../../shared/shared.module';


@NgModule({
  declarations: [
    JoinComponent
  ],
    imports: [
        CommonModule,
        JoinRoutingModule,
        SharedModule
    ]
})
export class JoinModule { }
