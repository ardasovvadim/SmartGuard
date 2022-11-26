import {Component} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ZoomService} from '../zoom/services/zoom.service';
import {JoinData} from '../../services/data.model';
import {DataStoreService} from '../../services/data-store.service';
import {Router} from '@angular/router';
import {SgSettings} from '../../shared/components/settings/settings.component';

@Component({
  selector: 'sg-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss'],
  providers: [
    ZoomService
  ]
})
export class JoinComponent {

  form: FormGroup = this.fb.group({
    userName: ['SmartGuard', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    meetingNumber: ['', [Validators.required]],
    passcode: ['', [Validators.required]]
  });
  isSettingHidden: boolean = true;

  constructor(
    private readonly fb: FormBuilder,
    private readonly zoomService: ZoomService,
    private readonly dataStoreService: DataStoreService,
    private readonly router: Router,
  ) {
  }

  join(settings: SgSettings) {
    if (this.form.invalid)
      return;

    const value = this.form.value as JoinData;
    value.sdkKey = 'PJ9u0n5V7ESkDkdlYYBpgjVOmDoRUQvwyZz2';
    value.leaveUrl = '/finish';

    this.zoomService.getSignature(
      value.meetingNumber,
      0
    ).subscribe(data => {
      value.signature = data.signature;
      value.settings = settings;
      this.dataStoreService.storeJoinData(value);
      this.router.navigate(['/zoom']);
    });
  }
}
