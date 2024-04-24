/**
 * @author Ilya
 */
import { NgModule, Injectable }           from '@angular/core';
import { Routes, RouterModule, Resolve }  from '@angular/router';
import { TranslateService }               from '@ngx-translate/core';
import { TranslateHttpLoader }            from '@ngx-translate/http-loader';
import { HttpClient }                     from '@angular/common/http';
import { Observable }                     from 'rxjs';

import { AppLandingComponent }            from './app-landing.component'
import { BlogComponent }                  from './components/blog/blog.component';
import { LandingComponent }               from './components/landing/landing.component';


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

const routes: Routes = [{
    path: '',
    component: AppLandingComponent,
    resolve: [TranslationResolverService],
    children: [
        { path: '', component: LandingComponent },
        { path: 'tournaments', component: BlogComponent},
    ]
}];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppLandingRoutingModule { }
