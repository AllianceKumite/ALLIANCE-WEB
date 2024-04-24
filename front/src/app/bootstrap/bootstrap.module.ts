// https://medium.com/@dpran433/build-your-own-custom-loader-for-translations-in-angular-8-cde0f3e88efd
// https://www.pluralsight.com/guides/lazy-loading-angular-modules-and-preloading-strategies
// https://jasonwatmore.com/post/2022/12/01/angular-14-redirect-to-previous-url-after-login-with-auth-guard
// TODO: Pluralization
// https://www.codeandweb.com/babeledit/tutorials/how-to-translate-your-angular-app-with-ngx-translate
// https://medium.com/@TuiZ/how-to-split-your-i18n-file-per-lazy-loaded-module-with-ngx-translate-3caef57a738f

import { NgModule }                             from '@angular/core';
import { BrowserModule }                        from '@angular/platform-browser';
import { HttpClientModule}                      from '@angular/common/http';
import { HttpClient }                           from '@angular/common/http';
import { TranslateModule, TranslateLoader }     from '@ngx-translate/core';
import { ChampTranslationLoader }               from './../shared/loader/ChampTranslateLoader';

import { DefaultUrlSerializer, UrlTree, UrlSerializer } from '@angular/router';

import { SharedModule } from '../shared/shared.module';

import { BootstrapRoutingModule } from './bootstrap-routing.module';
import { BootstrapComponent } from './bootstrap.component';

import { NavbarComponent } from './components/navbar/navbar.component';
import { ChampInfoComponent } from './components/champ-info/champ-info.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// import { BsDropdownModule }           from 'ngx-bootstrap/dropdown';
class LowerCaseUrlSerializer extends DefaultUrlSerializer {
    parse(url: string): UrlTree {
        return super.parse(url.toLowerCase());
    }
}

@NgModule({
  declarations: [
      BootstrapComponent,
      NavbarComponent,
      ChampInfoComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    SharedModule,
    BootstrapRoutingModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        // useFactory: HttpLoaderFactory,
        useClass: ChampTranslationLoader,
        deps: [HttpClient]
      },
      isolate: false,
      extend: true
    })
  ],
  providers: [ {
      provide: UrlSerializer,
      useClass: LowerCaseUrlSerializer
  }],
  bootstrap: [ BootstrapComponent ]
})
export class BootstrapModule { }
