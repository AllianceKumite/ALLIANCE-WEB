import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { HomeService } from '../../shared/services/home.service'
import { AuthenticationService } from './../../shared/services/authentication.service'

@Injectable({
  providedIn: 'root'
})
export class ChampGuard implements CanActivate {
  constructor(private homeSerivce: HomeService,
              private authenticationService: AuthenticationService,
              private router: Router
  ) {
  }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const url = route?.params?.name;

    if (url) {
        const result = await this.homeSerivce.getCurrentValidChampWithTitle(url) as [];

        try {
          if (result.length !== 0) {
            try{
              const isLoggedIn = await (this.authenticationService.getCurrentUser().toPromise());

              if (!!isLoggedIn) {
                await this.router.navigate([`champ/${url}/coach`]);
                return false;
              } else {
                await this.router.navigate([`champ/${url}/coach/login`]);
                return false;
              }
            } catch(e) {
              await this.router.navigate([`champ/${url}/coach/login`]);
              return false;
            }
          }
        } catch(e) { }
    }


    return true;
  }
}
