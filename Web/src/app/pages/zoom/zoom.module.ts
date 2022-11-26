import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {ZoomRoutingModule} from './zoom-routing.module';
import {ZoomComponent} from './zoom.component';
import {SharedModule} from '../../shared/shared.module';


@NgModule({
  declarations: [
    ZoomComponent,
  ],
  exports: [
  ],
  imports: [
    CommonModule,
    ZoomRoutingModule,
    SharedModule
  ]
})
export class ZoomModule { }
