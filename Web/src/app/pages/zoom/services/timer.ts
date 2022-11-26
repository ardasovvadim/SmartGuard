import {BehaviorSubject, filter, map, Observable, Subject, Subscription, takeUntil, tap, timer} from 'rxjs';

export class SgTimer {

  private readonly observable$: Observable<number>;
  private readonly _destroy = new Subject<void>();
  private sub: Subscription;
  private time = 0;
  private readonly tick = 100;
  private _isRunning = false;

  private timeSub: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  timeMs$ = this.timeSub.asObservable();
  timeSec = this.timeMs$.pipe(map(ms => ms / 1000));

  get isRunning(): boolean {
    return this._isRunning;
  }

  constructor(delegate: () => void, delay: number) {
    this.observable$ = timer(0, this.tick)
      .pipe(
        filter(() => this._isRunning),
        tap(() => {
          this.time += this.tick;
          this.timeSub.next(this.time);

          if (this.time % delay === 0 && this.time !== 0) {
            delegate();
          }
        }),
        takeUntil(this._destroy),
      );
  }


  start(): void {
    this._isRunning = true;

    if (!this.sub)
      this.sub = this.observable$.subscribe();
  }

  reset(): void {
    this.time = 0;
    this.timeSub.next(0);
  }

  stop(): void {
    this._isRunning = false;
  }

  destroy(): void {
    this.timeSub.complete();
    this._destroy.next();
    this._destroy.complete();
  }

}
