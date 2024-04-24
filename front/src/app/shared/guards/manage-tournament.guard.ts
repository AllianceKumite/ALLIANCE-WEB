import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service'


// TODO: rename it to SuperadminGuard
@Injectable({
    providedIn: 'root'
})
export class ManageTournamentGuard implements CanActivate {
    constructor(private authenticationService: AuthenticationService,
                private router: Router
        ) {
    }

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
      let hasRightToManage = false
      let url = state.url;


        const isSuperAdmin = (await (this.authenticationService.isSuperAdmin().toPromise()) as any).isSuperAdmin
        hasRightToManage = isSuperAdmin;
        hasRightToManage = false;

        if(!hasRightToManage) {
            let user = (await this.authenticationService.getCurrentUser().toPromise())

            let mIndex = url.indexOf("/manage")
            // console.log("guard nameOfTournament", nameOfTournament)
            let urlWithoutManage = url.substring(0, mIndex)
            let nameOfTournament = urlWithoutManage.substring(urlWithoutManage.lastIndexOf('/') + 1)

            if(user){
                hasRightToManage = this.authenticationService.userHasRightToManageTournament(user as any, nameOfTournament)
            }


            if (!hasRightToManage) {
                let redirectToPath = ['login'];

                this.router.navigate(redirectToPath, { queryParams: { returnUrl: state.url }});
            }
        }

        return hasRightToManage;
    }
}
