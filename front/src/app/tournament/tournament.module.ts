import { NgModule }                   from '@angular/core';
import { ModalModule }                from 'ngx-bootstrap/modal';
import { PortalModule }               from '@angular/cdk/portal';
import { HttpClient }                 from '@angular/common/http';
import { FormsModule }                from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader }        from '@ngx-translate/http-loader';
import { ChampTranslationLoader }     from './../shared/loader/ChampTranslateLoader';

import { SharedModule }               from '../shared/shared.module'
// import { OrderService }               from './services/order.service';

import { TournamentRoutingModule }    from './tournament-routing.module';

import { TournamentComponent }        from './components/tournament/tournament.component';
// import { SidebarCountriesComponent } from './components/sidebars/sidebar-countries/sidebar-countries.component';
// import { SidebarClubsComponent }   from './components/sidebars/sidebar-clubs/sidebar-clubs.component';
// import { FilterCoachesComponent }  from './components/sidebars/filter-coaches/filter-coaches.component';
import { ParticipantsListComponent }  from './components/tournament/participants/participants-list/participants-list.component';
import { TatamiComponent }            from './components/tournament/tatami/tatami.component';
import { OnlineComponent }            from './components/tournament/online/online.component';
import { TatamiTitleComponent }       from './components/tatami-title/tatami-title.component';
import { InfoBoxComponent }           from './components/info-box/info-box.component';
import { FightComponent }             from './components/fight/fight.component';
import { CurrentFightComponent }      from './components/tournament/current-fight/current-fight.component';
import { FightCounterComponent }      from './components/fight-counter/fight-counter.component';
import { ParticipantComponent }       from './components/participant/participant.component';
import { ParticipantFightManagerMarkComponent } from './components/participant-fight-manager-mark/participant-fight-manager-mark.component';
import { OnlynumberDirective }        from './components/onlynumber/only-number.directive';
import { ParticipantFightManagerFlagComponent } from './components/participant-fight-manager-flag/participant-fight-manager-flag.component';
import { ParticipantFlagsComponent }  from './components/participant-flags/participant-flags.component';
import { FullscreenBtnComponent }     from './components/fullscreen-btn/fullscreen-btn.component';
import { OnlineTatamiComponent }      from './components/online-tatami/online-tatami.component';
import { ParticipantPhotoComponent }  from './components/participant-photo/participant-photo.component';
import { DrawComponent }              from './components/tournament/draw/draw.component';
import { DrawOlympicComponent }       from './components/tournament/draw/draw-olympic/draw-olympic.component';
import { DrawCircleComponent }        from './components/tournament/draw/draw-circle/draw-circle.component';
import { DrawWkbComponent }           from './components/tournament/draw/draw-wkb/draw-wkb.component';
import { ConfirmModalComponent }      from './components/confirm-modal/confirm-modal.component';
import { ResultComponent }            from './components/tournament/result/result.component';
import { ManagementComponent }        from './components/tournament/management/management.component';
import { ResultIndividualComponent }  from './components/result-individual/result-individual.component';
import { ResultEntityComponent }      from './components/result-entity/result-entity.component';
import { HamburgerToggleDirective }   from './components/hamburger-toggle/hamburger-toggle.directive';
import { ParticipantClubInfoComponent } from './components/participant-club-info/participant-club-info.component';
import { HomeComponent }              from './components/tournament/home/home.component';
import { CategoryNameComponent }      from './components/category-name/category-name.component';
import { MenuItemComponent }          from './components/menu-item/menu-item.component';
import { LevelNameComponent }         from './components/level-name/level-name.component';
import { ExportdrawComponent }        from './components/tournament/tools/exportdraw/exportdraw.component';

import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';
// import  PDFDocument from 'pdfkit';
import { DiplompdfComponent } from './components/tournament/tools/diplompdf/diplompdf.component';
import { FontPickerModule } from 'ngx-font-picker';
// import { FONT_PICKER_CONFIG } from 'ngx-font-picker';
// import { FontPickerConfigInterface } from 'ngx-font-picker';
import { OverlayComponent } from './components/tournament/tools/overlay/overlay.component';
import { ExportxlsComponent } from './components/tournament/tools/exportxls/exportxls.component';
import { ChangetatamiComponent } from './components/tournament/tools/changetatami/changetatami.component';
import { ManagefightComponent } from './components/tournament/tools/managefight/managefight.component';
import { AlldiplompdfComponent } from './components/tournament/tools/alldiplompdf/alldiplompdf.component';
import { NgOptimizedImage } from '@angular/common';
// import {provideImageKitLoader} from '@angular/common';
import { RegreferyComponent } from './components/regrefery/regrefery.component';
import { AutocompleteLibModule }        from 'angular-ng-autocomplete';
import { ReferysComponent } from './components/tournament/referys/referys.component';
// import { ManageReferyComponent } from './components/tournament/manage-refery/manage-refery.component';
import { ReferyBrigadeComponent } from './components/tournament/refery-brigade/refery-brigade.component';
import { PersonalAppComponent } from './components/tournament/tools/personal-app/personal-app.component';
import { WinnerClubsComponent } from './components/winner-clubs/winner-clubs.component';
import { CoachbytatamiComponent } from './components/tournament/coachbytatami/coachbytatami/coachbytatami.component';

// const DEFAULT_FONT_PICKER_CONFIG: FontPickerConfigInterface = {
//   apiKey: 'AIzaSyBk1pJ8iQ5BDjZ3N1AEMCa-9E38Vtlu2SQ',
// };

@NgModule({
  declarations: [
    TournamentComponent,
    // SidebarCountriesComponent,
    // SidebarClubsComponent,
    // FilterCoachesComponent,
    ParticipantsListComponent,
    FullscreenBtnComponent,
    TatamiComponent,
    OnlineComponent,
    TatamiTitleComponent,
    InfoBoxComponent,
    FightComponent,
    CurrentFightComponent,
    FightCounterComponent,
    ParticipantComponent,
    ParticipantFightManagerFlagComponent,
    ParticipantFlagsComponent,
    ParticipantFightManagerMarkComponent,
    OnlynumberDirective,
    OnlineTatamiComponent,
    ParticipantPhotoComponent,
    DrawComponent,
    DrawOlympicComponent,
    DrawCircleComponent,
    DrawWkbComponent,
    // ChampInfoComponent,
    ResultComponent,
    ResultIndividualComponent,
    ResultEntityComponent,
    ManagementComponent,
    HamburgerToggleDirective,
    ConfirmModalComponent,
    ParticipantClubInfoComponent,
    HomeComponent,
    CategoryNameComponent,
    MenuItemComponent,
    LevelNameComponent,
    ExportdrawComponent,
    DiplompdfComponent,
    OverlayComponent,
    ExportxlsComponent,
    ChangetatamiComponent,
    ManagefightComponent,
    AlldiplompdfComponent,
    RegreferyComponent,
    ReferysComponent,
    // ManageReferyComponent,
    ReferyBrigadeComponent,
    PersonalAppComponent,
    WinnerClubsComponent,
    CoachbytatamiComponent,

    // AutoOpenMenuComponent
  ],
  imports: [
    TournamentRoutingModule,
    DragDropModule,
    CdkDrag,
    CdkDropList,
    AutocompleteLibModule,

    SharedModule,
    FormsModule,
    PortalModule,
    FontPickerModule,
    NgOptimizedImage,
    ModalModule.forRoot(),
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useClass: ChampTranslationLoader,
        deps: [HttpClient],
      },
      // ,isolate: false,
      // extend: true
    }),
  ],
  // providers: [
  //   provideImageKitLoader("assets/media/champ")
  // ],
  // providers: [
  //   {
  //     provide: FONT_PICKER_CONFIG,
  //     useValue: DEFAULT_FONT_PICKER_CONFIG,
  //   },
  // ],
})
export class TournamentModule {}
