import { NgModule, Injectable }           from '@angular/core';
import { Routes, RouterModule, Resolve }  from '@angular/router';
import { TranslateService }               from '@ngx-translate/core';
import { TranslateHttpLoader }            from '@ngx-translate/http-loader';
import { HttpClient }                     from '@angular/common/http';
import { Observable }                     from 'rxjs';

import { AuthenticationComponent }        from './authentication/authentication.component';
import { RegistrationComponent }          from './registration/registration.component';
import { ForgotPasswordResetComponent }   from './forgot-password-reset/forgot-password-reset.component';
import { ForgotPasswordComponent }        from './forgot-password/forgot-password.component';

import { CoachGuard }                     from './../shared/guards/coach.guard';


@Injectable({ providedIn: 'root' })
export class TranslationResolverService implements Resolve<any> {
    constructor(private translateService: TranslateService) {}

    resolve(): Observable<any> {
        return this.translateService.getTranslation(
            this.translateService.currentLang
        );
    }
}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

const loginRegisterRoutes = [{
    path: 'login',
    component: AuthenticationComponent
},{
    path: 'registration',
    component: RegistrationComponent
}]



let routes: Routes = [{
      path: '',
      resolve: [TranslationResolverService],
      children: [{
          path: 'champ/:name',
          // component: TournamentComponent,
          children: [{
              path: 'coach',
              children: loginRegisterRoutes
          }],
      },
      loginRegisterRoutes[0],
      loginRegisterRoutes[1],
      {
        path: 'coach',
        children: loginRegisterRoutes
    },
    {
        path: 'coach/:id',
        component: RegistrationComponent,
        runGuardsAndResolvers: 'always',
        canActivate: [CoachGuard]
    },
    {
        path: 'administrator/login',
        component: AuthenticationComponent,
    },
    {
        path: 'forgot-password',
        component: ForgotPasswordComponent
    },
    {
        path: 'forgot-password-reset',
        component: ForgotPasswordResetComponent
    }]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
