import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthenticationService } from '../../shared/services/authentication.service'


// TODO: rename it to SuperadminGuard
@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private authenticationService: AuthenticationService,
                private router: Router
        ) {
    }

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        let url = state.url;
        let isLoginOrRegister = url.indexOf("/login") != -1 || url.indexOf("/registration") != -1;
        const isSuperAdmin = (await (this.authenticationService.isSuperAdmin().toPromise()) as any).isSuperAdmin;

        if(!isLoginOrRegister && !isSuperAdmin) {
            let redirectToPath = ['administrator', 'login'];

            this.router.navigate(redirectToPath, { queryParams: { returnUrl: state.url, superAdmin : true }});

            return false;
        }

        return true;
    }
}
