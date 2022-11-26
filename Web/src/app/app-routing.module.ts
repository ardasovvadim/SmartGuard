import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CheckJoinDataGuard} from './guards/check-join-data.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'join',
    pathMatch: 'full'
  },
  {
    path: 'zoom',
    loadChildren: () => import('./pages/zoom/zoom.module').then(m => m.ZoomModule),
    canLoad: [CheckJoinDataGuard]
  },
  {path: 'mq-test', loadChildren: () => import('./pages/mq-test/mq-test.module').then(m => m.MqTestModule)},
  {path: 'join', loadChildren: () => import('./pages/join/join.module').then(m => m.JoinModule)},
  {path: 'finish', loadChildren: () => import('./pages/finish/finish.module').then(m => m.FinishModule)},
  { path: 'statistic', loadChildren: () => import('./pages/statistic/statistic.module').then(m => m.StatisticModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
