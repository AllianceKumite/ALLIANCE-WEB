import { NgModule }                     from '@angular/core';
import { HttpClient }                   from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader }          from '@ngx-translate/http-loader';
import { DefaultUrlSerializer, UrlTree, UrlSerializer } from '@angular/router';
import { AutocompleteLibModule }        from 'angular-ng-autocomplete';
import { SharedModule }                 from './../shared/shared.module'

import { AuthRoutingModule }            from './auth-routing.module';
// import { AppLandingComponent }       from './app-landing.component';

import { AuthenticationComponent }      from './authentication/authentication.component';
import { RegistrationComponent }        from './registration/registration.component';
import { ForgotPasswordComponent }      from './forgot-password/forgot-password.component';
import { ForgotPasswordResetComponent } from './forgot-password-reset/forgot-password-reset.component';




export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

class LowerCaseUrlSerializer extends DefaultUrlSerializer {
    parse(url: string): UrlTree {
        return super.parse(url.toLowerCase());
    }
}

@NgModule({
  declarations: [
    AuthenticationComponent,
    RegistrationComponent,
    ForgotPasswordComponent,
    ForgotPasswordResetComponent,
  ],
  imports: [
    SharedModule,
    AuthRoutingModule,
    AutocompleteLibModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
      // ,extend: true
    })
  ],
  providers: [{
    provide: UrlSerializer,
    useClass: LowerCaseUrlSerializer
  }]
})
export class AuthModule { }
