import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ToolbarComponent} from './components/toolbar/toolbar.component';
import {CommonModule} from '@angular/common';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MoveableCardComponent} from './components/moveable-card/moveable-card.component';
import {AlertColorToIconPipe} from './pipes/alert-color-to-icon.pipe';
import {BoolToIconPipe} from './pipes/bool-to-icon.pipe';
import {NullAsLoadingPipe} from './pipes/null-as-loading.pipe';
import {SortAlertsPipe} from './pipes/sort-alerts.pipe';
import {AlertCodeToTextPipe} from './pipes/alert-code-to-text.pipe';
import { SettingsComponent } from './components/settings/settings.component';


@NgModule({
  declarations: [
    ToolbarComponent,
    MoveableCardComponent,
    AlertColorToIconPipe,
    BoolToIconPipe,
    NullAsLoadingPipe,
    SortAlertsPipe,
    AlertCodeToTextPipe,
    SettingsComponent,
  ],
  imports: [
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    DragDropModule,
  ],
  exports: [
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ToolbarComponent,
    AlertColorToIconPipe,
    AlertCodeToTextPipe,
    BoolToIconPipe,
    SettingsComponent,
    MoveableCardComponent
  ]
})
export class SharedModule {
}
