import { NgModule, Injectable } from '@angular/core';
import { Routes, RouterModule, Resolve, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { ManageTournamentGuard } from './../shared/guards/manage-tournament.guard'

import { HomeComponent } from './components/tournament/home/home.component';
import { TournamentComponent } from './components/tournament/tournament.component';
import { DrawComponent } from './components/tournament/draw/draw.component';
import { OnlineComponent } from './components/tournament/online/online.component';
import { ParticipantsListComponent } from './components/tournament/participants/participants-list/participants-list.component';
import { ResultComponent } from './components/tournament/result/result.component';
import { TatamiComponent } from './components/tournament/tatami/tatami.component';
import { ManagementComponent } from './components/tournament/management/management.component';
import { ExportdrawComponent } from './components/tournament/tools/exportdraw/exportdraw.component';
import { DiplompdfComponent } from './components/tournament/tools/diplompdf/diplompdf.component';
import { OverlayComponent } from './components/tournament/tools/overlay/overlay.component';
import { ExportxlsComponent } from './components/tournament/tools/exportxls/exportxls.component';
import { ChangetatamiComponent } from './components/tournament/tools/changetatami/changetatami.component';
import { ManagefightComponent } from './components/tournament/tools/managefight/managefight.component';
import { AlldiplompdfComponent } from './components/tournament/tools/alldiplompdf/alldiplompdf.component';
import { RegreferyComponent } from './components/regrefery/regrefery.component';
import { ReferysComponent } from './components/tournament/referys/referys.component';
// import { ManageReferyComponent } from './components/tournament/manage-refery/manage-refery.component';
import { ReferyBrigadeComponent } from './components/tournament/refery-brigade/refery-brigade.component';
import { PersonalAppComponent } from './components/tournament/tools/personal-app/personal-app.component';
import { WinnerClubsComponent } from './components/winner-clubs/winner-clubs.component';
import { CoachbytatamiComponent } from './components/tournament/coachbytatami/coachbytatami/coachbytatami.component';


@Injectable({ providedIn: 'root' })
export class TranslationResolverService implements Resolve<any> {
    constructor(private translateService: TranslateService) {}

    resolve(): Observable<any> {
        return this.translateService.getTranslation(
            this.translateService.currentLang
        );
    }
}

const routes: Routes = [
  {
    path: '',
    component: TournamentComponent,
    resolve: [TranslationResolverService],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      // { path: '', component: TournamentComponent },
      { path: 'home', component: HomeComponent },
      { path: 'participants', component: ParticipantsListComponent },
      { path: 'tatami', component: TatamiComponent },
      { path: 'online', component: OnlineComponent },
      { path: 'draw', component: DrawComponent },
      { path: 'result', component: ResultComponent },
      { path: 'exportdraw', component: ExportdrawComponent },
      { path: 'diplompdf', component: DiplompdfComponent },
      { path: 'alldiplompdf', component: AlldiplompdfComponent },
      { path: 'exportxls', component: ExportxlsComponent },
      { path: 'overlay', component: OverlayComponent },
      { path: 'changetatami', component: ChangetatamiComponent },
      { path: 'regrefery', component: RegreferyComponent },
      { path: 'referys', component: ReferysComponent },
      { path: 'managefight', component: ManagefightComponent },
      { path: 'champrefery', component: ReferyBrigadeComponent },
      { path: 'personalapp', component: PersonalAppComponent },
      { path: 'winnerclub', component: WinnerClubsComponent },
      { path: 'coachbytatami', component: CoachbytatamiComponent },
      {
        path: 'manage',
        component: ManagementComponent,
        runGuardsAndResolvers: 'always',
        canActivate: [ManageTournamentGuard],
      },
    ],
  },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TournamentRoutingModule { }
