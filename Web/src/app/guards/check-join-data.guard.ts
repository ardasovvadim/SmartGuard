import {Injectable} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanLoad,
  Route, Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree
} from '@angular/router';
import {Observable} from 'rxjs';
import {DataStoreService} from '../services/data-store.service';

@Injectable({
  providedIn: 'root'
})
export class CheckJoinDataGuard implements CanLoad {

  constructor(
    private readonly dataStoreService: DataStoreService,
    private readonly router: Router
  ) {
  }

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const sessionId = this.dataStoreService.getSessionIdFromQuery();
    const result = this.dataStoreService.isJoinData() || sessionId != null;
    if (!result)
      this.router.navigate(['/join']);
    return result;
  }

}
