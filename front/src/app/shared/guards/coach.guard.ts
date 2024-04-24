import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthenticationService } from './../../shared/services/authentication.service'

@Injectable({
    providedIn: 'root'
})
export class CoachGuard implements CanActivate {
    constructor(private authenticationService: AuthenticationService,
                private router: Router,
                private activeRoute: ActivatedRoute
    ) {
    }

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        let url = state.url;
        let isLoginOrRegister = url.indexOf("/login") != -1 || url.indexOf("/registration") != -1;

        if(!this.authenticationService.isAuthenticated() && !isLoginOrRegister) {
            let redirectToPath = ['coach', 'login'];

            if (url.indexOf('/champ/') != -1) {
                url = url.substring('/champ/'.length);
                let champName = url.substring(0, url.indexOf("/"));
                redirectToPath.unshift('champ', champName);
            }

            this.router.navigate(redirectToPath, { queryParams: { returnUrl: state.url }});

            return false;
        }

        return true;
    }
}
