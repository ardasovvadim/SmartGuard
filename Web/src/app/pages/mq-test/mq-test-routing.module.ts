import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MqTestComponent } from './mq-test.component';

const routes: Routes = [{ path: '', component: MqTestComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MqTestRoutingModule { }
