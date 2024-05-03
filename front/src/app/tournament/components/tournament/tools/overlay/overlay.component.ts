import { Component, HostListener, Input, OnInit, OnDestroy } from '@angular/core';
import { Tatami } from '../../../../models/tatami.model';
import { TournamentService } from '../../../../services/tournament.service';
import { HomeService } from 'src/app/shared/services/home.service';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-overlay',
  templateUrl: './overlay.component.html',
  styleUrls: ['./overlay.component.css'],
})
export class OverlayComponent implements OnInit, OnDestroy {
  filter: any = {
    title: null,
  };

  SETTINGS = {
    COLLAPSED_CATEGORIES_NUMBER: 4,
    CURRENT_FIGHT_SIZE: 4,
  };

  REFRESH_TIMEOUT = 15.0;
  REFRESH_TIME_TIMEOUT = 1;
  // REFRESH_TIMEOUT = 3.5

  tatamies: Tatami[];
  timertatamies: any;
  tatamiesIds: any[] = [];

  isActive: any[] = [];

  isMobileView: boolean = false;
  champName;

  champtitle;
  citytitle;
  tournament: any;
  timeoutId;
  timeoutId1;
  firstName;
  lastName;


  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.isMobileView = event.target.screen.width < 990;
  }

  constructor(
    private tournamentService: TournamentService,
    private activatedRouter: ActivatedRoute,
    private translateService: TranslateService,
    private homeService: HomeService
  ) {}

  ngOnInit(): void {
    this.isMobileView = window.screen.width < 990;
    this.homeService._champInfo.subscribe((champInfo) => {
      this.tournament = champInfo[1];

      this.getChampInfo();
      this.translateService.onLangChange.subscribe((event) => {
        this.getChampInfo();
      });
    });

    this.activatedRouter.parent.params.subscribe((params) => {
      const result = params['name'];
      this.champName = result;

      this.filter = {
        title: result,
      };
    });
    // this.getChampInfo();
    this.requestTatamisInfo(() => this.requestTatamisCurrentFightsByTimeout());
    // this.getDataTimer(() => this.getTimerTatamis());
  }

  getTimerString(idx) {
    let minutes = Math.floor(this.timertatamies[idx] / 60);
    let seconds = this.timertatamies[idx] - minutes * 60;

    return (
      minutes.toString().padStart(2, '0') +
      ':' +
      seconds.toString().padStart(2, '0')
    );
  }

  getFIO(FIO){
    this.parseFio(FIO);
    return this.firstName + ' ' + this.lastName;
  }

  parseFio(FIO) {
    if (typeof FIO?.split == 'function') {
      
      let splitted = FIO?.split(' ');
      this.lastName = splitted?.length > 0 ? splitted[1] : '';
      this.firstName = splitted?.length > 1 ? splitted[0] : '';  
    }
  }


  getChampInfo() {
    let lng = localStorage.getItem('lng');
    if (lng === 'ru') {
      this.champtitle = this.tournament?.champNameRu;
      this.citytitle = this.tournament?.champCityRu;
    }
    if (lng === 'ua') {
      this.champtitle = this.tournament?.champNameUa;
      this.citytitle = this.tournament?.champCityUa;
    }
    if (lng === 'en') {
      this.champtitle = this.tournament?.champNameEn;
      this.citytitle = this.tournament?.champCityEn;
    }
  }

  requestTatamisInfoByTimeout() {
    this.timeoutId = setTimeout(() => {
      this.requestTatamisInfo(this.requestTatamisInfoByTimeout);
    }, this.REFRESH_TIMEOUT * 1000);
  }

  getTimerTatamis() {
    this.timeoutId1 = setTimeout(() => {
      this.getDataTimer(() => this.getTimerTatamis());
    }, 1000);
  }

  requestTatamisCurrentFightsByTimeout() {
    this.timeoutId = setTimeout(() => {
      this.requestTatamisCurrentFights(() =>
        this.requestTatamisCurrentFightsByTimeout()
      );
    }, this.REFRESH_TIMEOUT * 1000);

    // clearInterval(this.timeoutId);
  }

  requestTatamisCurrentFights(callback) {

    this.tournamentService
      .getTatamisCurrentFight(this.filter)
      .subscribe((response) => {
        this.updateTatamisCurrentFights(response);

        if (typeof callback == 'function') {
          callback();
        }
      });
  }

  getDataTimer(callback) {
    this.tournamentService.getTatamiTime('tourn1').subscribe((response) => {

      this.timertatamies = response;
      return this.timertatamies;
    });
    if (typeof callback == 'function') {
      callback();
    }
  }

  requestTatamisInfo(callback) {
    this.tournamentService.getTatami(this.filter).subscribe((response) => {
      this.tatamies = Object.values(response).map((tatami) => {
        this.tatamiesIds.push(tatami.categoriesIds);

        tatami.categoriesIds = tatami.categoriesIds.filter((x, i) =>
          this.shouldCategoryBeShown(tatami, i)
        );

        return tatami;
      });
      
      if (typeof callback == 'function') {
        callback();
      }
    });
  }

  updateTatamisCurrentFights(newFights) {
    let hasChanged = false;

    for (let i = 0; i < this.tatamies.length; i++) {
      let updatedFight = newFights[i + 1];
      if (updatedFight) {
        if (
          !this.tatamies[i]?.fight ||
          (this.tatamies[i]?.fight &&
            this.tatamies[i]?.fight.details.ownId != updatedFight.details.ownId)
        ) {
          this.tatamies[i].fight = updatedFight;
          hasChanged = true;
        } else {
          // Doing nothing with tatami ', i + 1)
        }
      } else {
        if (this.tatamies[i]?.fight) {
          // Deleting current fight for tatami ', i + 1

          this.tatamies[i].fight = null;
          hasChanged = true;
        }
      }
    }
  }

  shouldCategoryBeShown(tatami, categoryIndex) {
    let isCuttentFightExpanded = typeof tatami.fight !== 'undefined';

    let sizeWithCurrentFightExpanded =
      this.SETTINGS.COLLAPSED_CATEGORIES_NUMBER;
    let sizeWithCurrentFightCollapsed =
      sizeWithCurrentFightExpanded + this.SETTINGS.CURRENT_FIGHT_SIZE;

    return (
      (isCuttentFightExpanded &&
        categoryIndex < sizeWithCurrentFightExpanded) ||
      (!isCuttentFightExpanded && categoryIndex < sizeWithCurrentFightCollapsed)
    );
  }

  ngOnDestroy(): void {
    clearInterval(this.timeoutId);
  }
}
