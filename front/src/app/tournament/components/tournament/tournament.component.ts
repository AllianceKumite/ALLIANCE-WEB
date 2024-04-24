import { Component, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, IsActiveMatchOptions } from '@angular/router';
import { Event, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { TranslateHttpLoader }        from '@ngx-translate/http-loader';
import { HttpClient }                 from '@angular/common/http';
import { NgSelectComponent }          from '@ng-select/ng-select';
import { TranslateService }           from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { environment }                from 'src/environments/environment';
import { HomeService }                from '../../../shared/services/home.service'
import { UtilService }                from '../../../shared/services/util.service'


import { TournamentService }          from '../../services/tournament.service';
import { TatamiTitleComponent }       from '../tatami-title/tatami-title.component';
import { AuthenticationService }      from '../../../shared/services/authentication.service';
import { NavItem }                    from '../menu-item/nav-item';

import { TatamiComponent } from './tatami/tatami.component';
import { MenuItemComponent } from '../menu-item/menu-item.component';
import { Dropdown }                    from 'mdb-ui-kit';


@Component({
  selector: 'app-tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class TournamentComponent implements OnInit {
  @ViewChild('categorySelector') categorySelector: NgSelectComponent;
  @ViewChild('drawSelector') drawSelector: NgSelectComponent;
  @ViewChild('tatamiSelector') tatamiSelector: NgSelectComponent;
  @ViewChild('resultSelector') resultSelector: NgSelectComponent;
  @ViewChild('countrySelector') countrySelector: NgSelectComponent;
  @ViewChild('clubSelector') clubSelector: NgSelectComponent;
  @ViewChild('coachSelector') coachSelector: NgSelectComponent;
  @ViewChild('toolsSelector') toolsSelector: NgSelectComponent;
  @ViewChild('adminSelector') adminSelector: NgSelectComponent;
  @ViewChild('registrySelector') registrySelector: NgSelectComponent;

  resultsDropdown;

  // @ViewChild('individualResultSelector') individualResultSelector: HTMLElement;

  routerLinkActiveOptions: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'subset',
    matrixParams: 'ignored',
    fragment: 'ignored',
  };

  champType: number;
  showCountriesFilter: boolean = false;
  showClubsFilter: boolean = false;
  showCoachesFilter: boolean = false;

  categories: any[] = [];
  categoriesWithAll: any[] = [];
  tatamis: any[] = [];
  tatamisInit: any[] = [];
  results: any[];
  teamCompetitionCount = 0;
  isCheckQuota = false;              

  tools: any[] = [
    { id: 1, name: 'exportDrawToPdf', path: 'exportdraw' },
    { id: 2, name: 'exportxls', path: 'exportxls' },
    { id: 3, name: 'personalapp', path: 'personalapp' }
    // { id: 4, name: 'exportDiplomToPdf', path: 'diplompdf' },
    // { id: 5, name: 'overlay', path: 'overlay' },
    // { id: 6, name: 'exportAllDiplomToPdf', path: 'alldiplompdf' },
  ];

  registry: any[] = [
    { id: 1, name: 'coach', path: 'coach' },
    { id: 2, name: 'regrefery', path: 'regrefery' },
  ];

  admins: any[] = [
    { id: 1, name: 'changetatami', path: 'changetatami' },
    { id: 2, name: 'managefight', path: 'managefight' },
    { id: 3, name: 'managerefery', path: 'champrefery' },
    { id: 4, name: 'exportDiplomToPdf', path: 'diplompdf' },
    { id: 5, name: 'overlay', path: 'overlay' },
    { id: 6, name: 'exportAllDiplomToPdf', path: 'alldiplompdf' }

  ];

  imageUrl: string[];

  nameOfChampionship: string = '';

  selectedParticipantsCategory: number;
  selectedDraw: any;
  selectedTatami: any;
  selectedResult: any;
  selectedCountry: any;
  selectedClub: any;
  selectedCoach: any;
  selectedTools: any;
  selectedAdmin: any;
  selectedRegistry: number;

  isOpen: any = {
    categories: false,
    draw: false,
    online: false,
    result: false,
  };

  countries: any[] = [];
  clubs: any[] = [];
  coaches: any[] = [];

  tatamiType: number;

  isMobileView: boolean = false;
  isCoachPage: boolean = false;
  isSuperAdmin: boolean = false;

  hasRightToManage: boolean = false;

  manageable: boolean = false;
  registerable: boolean = false;
  registerableCoach: boolean = false;
  registerableRefery: boolean = false;

  readonly logosDir: string = `${environment.logosDir}`;
  currentChampName: string = '';

  resultsMenuItems: NavItem[];
  userLabel: string;

  subscription: Subscription;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.isMobileView = event.target.screen.width < 990;

    if (this.isMobileView) {
      this.tatamis = this.tatamis.filter((x) => x.id !== 0);
    } else {
      this.tatamis = this.tatamisInit;
    }
  }

  constructor(
    private tournamentService: TournamentService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private homeService: HomeService,
    private translateService: TranslateService,
    private authenticationService: AuthenticationService,
    private utilService: UtilService
  ) {
    this.assignEvents();
  }

  initHasRightToManage() {
    this.authenticationService.isSuperAdmin().subscribe((response) => {
      let userIsSuperAdmin = (response as any).isSuperAdmin;
      this.isSuperAdmin = userIsSuperAdmin;

      this.hasRightToManage = userIsSuperAdmin;

      if (!this.hasRightToManage) {
        this.authenticationService.getCurrentUser().subscribe((response) => {
          this.hasRightToManage =
            this.authenticationService.userHasRightToManageTournament(
              response as any,
              this.nameOfChampionship
            );
          this.userLabel = (response as any)?.coach;
        });
      } else {
        this.userLabel = 'AllianceKumite';
      }
    });
  }

  isHidden(id) {
    let result = false;
    if (id == 5 && !this.isSuperAdmin) {
      result = true;
    }

    return result;
  }

  async ngOnInit() {
    this.isMobileView = window.screen.width < 990;

    try {
      this.isCoachPage = this.router.url.split('/')[3] === 'coach';
    } catch (e) {
      this.isCoachPage = false;
    }

    this.subscription = this.homeService._champInfo.subscribe((champInfo) => {
      let tournament = champInfo[1];
      this.tatamiType = tournament ? +tournament['typeTatami'] : null;
      this.manageable = this.isManageable(tournament);
      this.registerable = this.isRegisterable(tournament);
    });

    this.activeRoute.paramMap.subscribe((param) => {
      const name = param['params']['name'];
      this.nameOfChampionship = name;

      this.initHasRightToManage();

      this.tournamentService.getChampType(name).subscribe((response) => {
        this.champType = response['type'];

        this.adjustFiltersVisibility(this.champType);
      });

      this.homeService.getChampInfo(name);
        this.homeService._champInfo.subscribe((champInfo) => {
          let tournament = champInfo[1];
          this.teamCompetitionCount = tournament['teamcompetition'];
          this.isCheckQuota = this.teamCompetitionCount > 0;              
        });
    
      this.tournamentService
        .getCountries({
          title: name,
          lng: localStorage.getItem('lng'),
          all: false,
        })
        .subscribe((response) => {
          this.countries = Object.values(response);
        });

      this.tournamentService.getClubs({ title: name }).subscribe((response) => {
        this.clubs = Object.values(response);
        this.clubs.sort(function(a, b){
          return a.ClubId - b.ClubId
        })
      });

      this.tournamentService
        .getCoaches({ title: name })
        .subscribe((response) => {
          this.coaches = Object.values(response);
          });

      this.homeService
        .getCategories({ title: name })
        .subscribe((response: any[]) => this.initCategories(response));

      this.tournamentService
        .getAllTatami(name)
        .subscribe((response) => this.initTatamies(response));

      this.tournamentService.getTimesByTatamis(name).subscribe((response) => {
        // https://stackblitz.com/edit/dynamic-nested-menus-bgwf8h?file=app%2Fmenu-item%2Fmenu-item.component.html,app%2Fapp.component.html,app%2Fapp.component.ts
        setTimeout(() => this.initResultsMenu(response), 2500);
      });

    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  initCategories(response) {
   
    if (response) {
      let vals = Object.values(response);

      this.categories = Object.keys(response).map((w, index) => {
        return { id: w, name: vals[index] };
      });

      this.categoriesWithAll = JSON.parse(JSON.stringify(this.categories));

      this.categoriesWithAll.unshift({
        id: '0',
        name: this.translateService.instant('general.allParticipants'),
      });
    }
  }

  initTatamies(response) {
    const tatamiLength = response['tatamisCount'];

    this.tatamis = [
      {
        id: 0,
        name: this.translateService.instant('general.allTatamis'),
      },
    ];

    switch (tatamiLength) {
      case 4:
        this.tatamis.push({
          id: 102,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            102
          ),
        });
        this.tatamis.push({
          id: 304,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            304
          ),
        });
        break;
      case 5:
        this.tatamis.push({
          id: 103,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            103
          ),
        });
        this.tatamis.push({
          id: 405,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            405
          ),
        });
        break;
      case 6:
        this.tatamis.push({
          id: 103,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            103
          ),
        });
        this.tatamis.push({
          id: 406,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            406
          ),
        });
        break;
      case 7:
        this.tatamis.push({
          id: 103,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            103
          ),
        });
        this.tatamis.push({
          id: 405,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            405
          ),
        });
        this.tatamis.push({
          id: 607,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            607
          ),
        });
        break;
      case 8:
        this.tatamis.push({
          id: 103,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            103
          ),
        });
        this.tatamis.push({
          id: 406,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            406
          ),
        });
        this.tatamis.push({
          id: 708,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            708
          ),
        });
        break;
      case 9:
        this.tatamis.push({
          id: 103,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            103
          ),
        });
        this.tatamis.push({
          id: 406,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            406
          ),
        });
        this.tatamis.push({
          id: 709,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            709
          ),
        });
        break;
      case 10:
        this.tatamis.push({
          id: 103,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            103
          ),
        });
        this.tatamis.push({
          id: 406,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            406
          ),
        });
        this.tatamis.push({
          id: 708,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            708
          ),
        });
        this.tatamis.push({
          id: 910,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            910
          ),
        });
        break;
      case 11:
        this.tatamis.push({
          id: 103,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            103
          ),
        });
        this.tatamis.push({
          id: 406,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            406
          ),
        });
        this.tatamis.push({
          id: 709,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            709
          ),
        });
        this.tatamis.push({
          id: 1011,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            1011
          ),
        });
        break;
      case 12:
        this.tatamis.push({
          id: 103,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            103
          ),
        });
        this.tatamis.push({
          id: 406,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            406
          ),
        });
        this.tatamis.push({
          id: 709,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            709
          ),
        });
        this.tatamis.push({
          id: 1012,
          name: TatamiTitleComponent.getTitle(
            this.translateService.instant('navbar.tatami'),
            this.tatamiType,
            1012
          ),
        });
        break;
    }

    for (let i = 1; i <= tatamiLength; i++) {
      this.tatamis.push({
        id: i,
        name: TatamiTitleComponent.getTitle(
          this.translateService.instant('navbar.tatami'),
          this.tatamiType,
          i
        ),
      });
    }

    this.tatamisInit = this.tatamis;

    if (this.isMobileView) {
      this.tatamis = this.tatamis.filter((x) => x.id !== 0);
    }
  }

  initResultsMenu(response) {
    this.resultsMenuItems = (<Array<any>>response).map((tatami) => ({
      id: tatami.TatamiId,
      displayName: TatamiTitleComponent.getTitle(
        this.translateService.instant('navbar.tatami'),
        this.tatamiType,
        tatami.TatamiId
      ),
      children: tatami.Times.split(',').map((time) => ({
        id: time,
        displayName: time + ' : 00',
      })),
    }));

    let resultsDropdown = document.getElementById('resultsDropdown');
    this.resultsDropdown = new Dropdown(resultsDropdown);

    resultsDropdown.addEventListener('mouseenter', (event) => {
      if (!this.isMobileView) {
        this.resultsDropdown.show();
      }
    });

    resultsDropdown.addEventListener('mouseleave', (event) => {
      if (!this.isMobileView) {
        this.resultsDropdown.hide();
      }
    });

    if (this.isMobileView) {
      // close all inner dropdowns when parent is closed
      window.document
        .querySelectorAll('.navbar .dropdown')
        .forEach(function (everydropdown) {
          everydropdown.addEventListener('hidden.bs.dropdown', function () {
            // after dropdown is hidden, then find all submenus
            this.querySelectorAll('.submenu').forEach(function (everysubmenu) {
              // hide every submenu as well
              everysubmenu.style.display = 'none';
            });
          });
        });

      window.document
        .querySelectorAll('.dropdown-menu a, .dropdown-toggle')
        .forEach(function (element) {
          element.addEventListener('click', function (e) {
            let nextEl = this.nextElementSibling;

            if (
              nextEl &&
              (nextEl.classList.contains('submenu') ||
                nextEl.classList.contains('mainsubmenu'))
            ) {
              // prevent opening link if link needs to open dropdown
              e.preventDefault();
              if (nextEl.style.display == 'block') {
                nextEl.style.display = 'none';
              } else {
                nextEl.style.display = 'block';
              }
            }

            if (this.classList.contains('time-item')) {
              e.preventDefault();

              setTimeout(() => {
                window.document
                  .querySelectorAll('h1')
                  .forEach(function (element) {
                    element.scrollIntoView(true);
                  });
              }, 1000);
            }
          });
        });
    }
  }

  adjustFiltersVisibility(champType) {
    if (champType == 1) {
      // внутриклубные
      this.showCountriesFilter = false;
      this.showClubsFilter = false;
      this.showCoachesFilter = true;
    } else if (champType == 2) {
      // региональные
      this.showCountriesFilter = false;
      this.showClubsFilter = true;
      this.showCoachesFilter = true;
    } else if (champType == 3) {
      // национальные
      this.showCountriesFilter = false;
      this.showClubsFilter = true;
      this.showCoachesFilter = true;
    } else if (champType == 4) {
      // клубные
      this.showCountriesFilter = true;
      this.showClubsFilter = true;
      this.showCoachesFilter = false;
    } else if (champType == 5) {
      // международные
      this.showCountriesFilter = true;
      this.showClubsFilter = true;
      this.showCoachesFilter = false;
    }

    // this.showCountriesFilter = true;
    // this.showClubsFilter = true;
    // this.showCoachesFilter = true;
  }

  assignEvents() {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.loadTranslationsOnChampChamge(event.url);
      }
    });
  }

  loadTranslationsOnChampChamge(currentUrl: string) {
    let champName = this.utilService.getChampNameFromUrl(currentUrl);

    if (this.currentChampName != champName) {
      this.currentChampName = champName;
      this.forceReloadTranslations(this.translateService, champName);
    }
  }

  forceReloadTranslations(translateService, champName) {
    // const currentLang = translateService.currentLang;
    translateService.currentLang = '';
    translateService.use(
      champName + (champName != '' ? '-' : '') + localStorage.getItem('lng')
    );
  }

  setCategory() {
    // this.router.navigate(['champ/' + this.nameOfChampionship + '/participants'], { queryParams: { 'category': this.selectedParticipantsCategory } });
    this.clearSelect();
  }

  setTatami() {
    // this.router.navigate(['champ/' + this.nameOfChampionship + '/online'], { queryParams: { 'tatami': this.selectedTatami } });
    this.clearSelect();
  }

  setDraw() {
    // this.router.navigate(['champ/' + this.nameOfChampionship + '/draw'], { queryParams: { 'category': this.selectedDraw } });
    // console.log(this.selectedDraw);
    
  }

  setResult() {
    // this.router.navigate(['champ/' + this.nameOfChampionship + '/result'], { queryParams: { 'offset': this.selectedResult } });
    this.clearSelect();
  }

  setRegistry() {
    // this.router.navigate(['champ/' + this.nameOfChampionship + '/result'], { queryParams: { 'offset': this.selectedResult } });
    this.clearSelect();
  }

  changeTools() {
    this.clearSelect();
  }

  changeRegistry() {
    this.clearSelect();
  }
  changeAdmins() {
    this.clearSelect();
  }

  setCountry() {
    if (this.nameOfChampionship) {
      // this.router.navigate(['champ/' + this.nameOfChampionship + '/participants'], { queryParams: { 'country': this.selectedCountry } });
      window.scrollTo(0, 0);
      this.clearSelect();
    }
  }

  changeClub() {
    if (this.nameOfChampionship) {
      // this.router.navigate(['champ/' + this.nameOfChampionship + '/participants'], { queryParams: { 'club': this.selectedClub } });
      window.scrollTo(0, 0);
      this.clearSelect();
    }
  }

  changeCoach() {
    if (this.nameOfChampionship) {
      // this.router.navigate(['champ/' + this.nameOfChampionship + '/participants'], { queryParams: { 'coach': this.selectedCoach } });
      window.scrollTo(0, 0);
      this.clearSelect();
    }
  }

  // TODO: DRY
  isManageable(tournament) {
    let manageble = false;

    if (tournament) {
      let fromTime = Date.parse(tournament.champFrom + 'T09:00:00');
      let toTime = Date.parse(tournament.champTo + 'T23:59:59');
      let now = Date.now();

      manageble = now >= fromTime && now <= toTime;
    }

    return manageble;
  }

  isRegisterable(tournament) {
    let registerable = false;

    if (tournament) {
      // let fromTime = Date.parse(tournament.champFrom + "T09:00:00");
      let toTime = Date.parse(tournament.champRegTo + 'T23:59:59');
      let fromChampTime = Date.parse(tournament.champFrom + 'T00:00:00');
      let now = Date.now();

      registerable = /*(now >= fromTime) && */ now <= fromChampTime;      
      this.registerableCoach = /*(now >= fromTime) && */ now <= toTime;      
      this.registerableRefery = /*(now >= fromTime) && */ now <= fromChampTime;    
    }

    return registerable;
  }

  clearSelect() {
    setTimeout(() => {
      let elem = document.getElementById('navbar-toggler');
      if (elem){
        elem.click();
      }
      this.selectedTatami = null;
      this.selectedParticipantsCategory = null;
      this.selectedDraw = null;
      this.selectedResult = null;
      this.selectedCountry = null;
      this.selectedClub = null;
      this.selectedCoach = null;
      this.selectedTools = null;
      this.selectedAdmin = null;
      this.selectedRegistry = null;
    });
  }

  // TODO: extend ng-select to be dropdownable-on-mouse-over
  // and remove this copypaste
  expandCategories() {
    if (!this.isMobileView) {
      this.categorySelector.open();
    }
  }

  collapseCategories() {
    if (!this.isMobileView) {
      this.categorySelector.close();
    }
  }

  blurCategories() {
    this.categorySelector.blur();
  }

  expandCountries() {
    if (!this.isMobileView) {
      this.countrySelector.open();
    }
  }

  collapseCountries() {
    if (!this.isMobileView) {
      this.countrySelector.close();
    }
  }

  blurCountries() {
    this.countrySelector.blur();
  }

  expandClubs() {
    if (!this.isMobileView) {
      this.clubSelector.open();
    }
  }

  collapseClubs() {
    if (!this.isMobileView) {
      this.clubSelector.close();
    }
  }

  blurClubs() {
    this.clubSelector.blur();
  }

  expandCoaches() {
    if (!this.isMobileView) {
      this.coachSelector.open();
    }
  }

  collapseCoaches() {
    if (!this.isMobileView) {
      this.coachSelector.close();
    }
  }

  blurCoaches() {
    this.coachSelector.blur();
  }

  expandDraws() {
    if (!this.isMobileView) {
      this.drawSelector.open();
    }
  }

  collapseDraws() {
    if (!this.isMobileView) {
      this.drawSelector.close();
    }
  }

  blurDraws() {
    this.drawSelector.blur();
  }

  expandTatamis() {
    if (!this.isMobileView) {
      this.tatamiSelector.open();
    }
  }

  collapseTatamis() {
    if (!this.isMobileView) {
      this.tatamiSelector.close();
    }
  }

  blurTatamis() {
    this.tatamiSelector.blur();
  }

  expandResults() {
    if (!this.isMobileView) {
      this.resultSelector.open();
    }
  }

  collapseResults() {
    if (!this.isMobileView) {
      this.resultSelector.close();
    }
  }

  blurResults() {
    this.resultSelector.blur();
  }

  expandTools() {
    if (!this.isMobileView) {
      this.toolsSelector.open();
    }
  }

  expandRegistry() {   
    if (!this.isMobileView) {
      this.registrySelector.open();
    }
  }

  collapseTools() {
    if (!this.isMobileView) {
      this.toolsSelector.close();
    }
  }

  collapseRegistry() {
    if (!this.isMobileView) {
      this.registrySelector.close();
    }
  }

  blurTools() {
    this.toolsSelector.blur();
  }

  blurRegistry() {
    this.registrySelector.blur();
  }

  expandAdmins() {
    if (!this.isMobileView) {
      this.adminSelector.open();
    }
  }

  collapseAdmins() {
    if (!this.isMobileView) {
      this.adminSelector.close();
    }
  }

  blurAdmins() {
    this.adminSelector.blur();
  }

  isLinkActive = (expectedUrl: string) => {
    var contains = this.containsSubstr(this.router.url, expectedUrl);

    return contains;
  };

  containsSubstr = (str: string, partOfStr: string) => {
    return str.indexOf(partOfStr) != -1;
  };

}
