import { NgModule, Injectable }           from '@angular/core';
import { Routes, RouterModule, Resolve }  from '@angular/router';
import { TranslateService }               from '@ngx-translate/core';
import { TranslateHttpLoader }            from '@ngx-translate/http-loader';
import { HttpClient }                     from '@angular/common/http';
import { Observable }                     from 'rxjs';

import { ManageParticipantsComponent }    from './manage-participants/ui/manage-participants.component'
import { ManageChampsComponent }          from './manage-champs/ui/manage-champs.component';

import { AuthGuard }                      from './../shared/guards/auth.guard';
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


let routes: Routes = [
  {
      path: 'champ/:name/coach',
      component: ManageParticipantsComponent,
      runGuardsAndResolvers: 'always',
      canActivate: [CoachGuard]
  },
  {
      path: 'coach',
      pathMatch: 'full',
      component: ManageParticipantsComponent,
      runGuardsAndResolvers: 'always',
      canActivate: [CoachGuard]
  },
  {
      path: 'administrator',
      component: ManageChampsComponent,
      runGuardsAndResolvers: 'always',
      canActivate: [AuthGuard],
      pathMatch: 'full'
  }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule{ }
