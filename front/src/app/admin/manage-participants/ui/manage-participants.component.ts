import { Component, OnInit, OnChanges, OnDestroy, AfterViewInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { ParticipantsService } from '../service/participants.service';
import { PageChangedEvent, PaginationModule } from 'ngx-bootstrap/pagination';
import * as XLSX from 'xlsx';

// import { Subject } from 'rxjs';
import {
  Athlete,
  AthleteValidation,
  Gender,
  GenderOption,
  Dan,
  DanOption,
  Division,
  DivisionOption,
  Coach,
  Branch,
  Filter,
} from '../model/athlete';
// import { DataTablesModule } from 'angular-datatables';
// import { DataTableDirective } from 'angular-datatables';
import { Role } from '../../../shared/types/Role';
import { TranslateService } from '@ngx-translate/core';
import { PageEvent } from '@angular/material/paginator';
import { environment } from 'src/environments/environment';
import { HomeService } from 'src/app/shared/services/home.service';

@Component({
  selector: 'manage-participants',
  templateUrl: './manage-participants.component.html',
  styleUrls: ['./manage-participants.component.css'],
})
export class ManageParticipantsComponent
  implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  model = new Filter();
  dtOptions: DataTables.Settings;

  athletesCount: number;
  participantsCount: number;

  gender: Array<GenderOption> = [
    { id: 1, name: Gender.MALE },
    { id: 2, name: Gender.FEMALE },
  ];

  dan: Array<DanOption> = [
    { id: 0, name: Dan.K0 },
    { id: 21, name: Dan.K11 },
    { id: 10, name: Dan.K10 },
    { id: 9, name: Dan.K9 },
    { id: 8, name: Dan.K8 },
    { id: 7, name: Dan.K7 },
    { id: 6, name: Dan.K6 },
    { id: 5, name: Dan.K5 },
    { id: 4, name: Dan.K4 },
    { id: 3, name: Dan.K3 },
    { id: 2, name: Dan.K2 },
    { id: 1, name: Dan.K1 },
    { id: 11, name: Dan.D1 },
    { id: 12, name: Dan.D2 },
    { id: 13, name: Dan.D3 },
    { id: 14, name: Dan.D4 },
    { id: 15, name: Dan.D5 },
    { id: 16, name: Dan.D6 },
    { id: 17, name: Dan.D7 },
    { id: 18, name: Dan.D8 },
    { id: 19, name: Dan.D9 },
    { id: 20, name: Dan.D10 },
  ];

  division: Array<DivisionOption> = [
    { id: 0, name: Division.KC },
    { id: 1, name: Division.FC },
    { id: 2, name: Division.LC },
    { id: 3, name: Division.SC },
    { id: 4, name: Division.PC },
    { id: 5, name: Division.K1C },
  ];

  dtLangOptions = {
    ua: {
      lengthMenu: 'Показати _MENU_ записів',
      info: 'Показана сторінка _PAGE_ з _PAGES_',
      search: 'Пошук:',
      paginate: {
        first: 'Перша',
        last: 'Остання',
        previous: 'Попередня',
        next: 'Наступна',
      },
    },
    ru: {
      lengthMenu: 'Показать _MENU_ записей',
      info: 'Показана страница _PAGE_ с _PAGES_',
      search: 'Поиск:',
      paginate: {
        first: 'Первая',
        last: 'Последняя',
        previous: 'Предыдущая',
        next: 'Следующая',
      },
    },
    en: {
      lengthMenu: 'Show _MENU_ entries',
      info: 'Showing page _PAGE_ of _PAGES_',
      search: 'Search:',
      paginate: {
        first: 'First',
        last: 'Last',
        previous: 'Previous',
        next: 'Next',
      },
    },
  };

  page = 1;
  pageSize = 100;
  searchPage = 1;

  length = 50;
  // pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25];
  hidePageSize = false;
  showPageSizeOptions = true;
  showFirstLastButtons = true;
  disabled = false;
  pageEvent: PageEvent;

  SUPER_ADMIN_ID = null;
  SUPER_ADMIN_NAME = null;
  branches: Branch[];
  allCoaches: any[] = [];
  allClubs: any[] = [];

  participants: Athlete[];
  athletes: Athlete[];

  activeAthlete = new Athlete();
  originalAthlete = new Athlete();
  submitted: boolean = false;
  activeAthleteValidationError: AthleteValidation | false = null;

  areAllAthletesSelected: boolean = false;
  areAllParticipantsSelected: boolean = false;
  selectedAthletes: Athlete[] = [];
  selectedParticipants: Athlete[] = [];

  searchValue: string = '';
  isShowRole: boolean = false;
  rowSelected: boolean;
  startItem: number = 0;
  searchedIndex;

  champName: string;
  programm: string;
  agecategory: string;
  champInfo: string;
  command: string;
  citychamp: string;
  datechamp: string;
  coachname: string;
  addrcoach: string;
  videofile;

  isCheckQuota: boolean = false;
  teamCompetitionCount: number = 0;

  readonly logosDir: string = `${environment.logosDir}`;

  constructor(
    private participantsService: ParticipantsService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private translateService: TranslateService,
    private homeService: HomeService,

  ) { }

  export() {
    let filename = `aaaa.xlsx`;
    let element = document.getElementById('tableapp');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Result');
    XLSX.writeFile(wb, filename);
  }


  tabletoExcel(table, name) {
    var uri = 'data:application/vnd.ms-excel;base64,'
      , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>'
      , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))); }
      , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }); };
    // if (!table.nodeType) table = document.getElementById(table);
    table = document.getElementById(table);
    var ctx = { worksheet: name || 'Worksheet', table: table.innerHTML };
    window.location.href = uri + base64(format(template, ctx));

  }

  // tableToExcel(table, name) {
  //   let uri = 'data:application/vnd.ms-excel;base64,'
  //     , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>'
  //     , base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) }
  //     , format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) }

  //   return function(table, name) {
  //     if (!table.nodeType) table = document.getElementById(table)
  //     var ctx = {worksheet: name || 'Worksheet', table: table.innerHTML}
  //     window.location.href = uri + base64(format(template, ctx))
  //   }
  // }
  onClearDivision() {
    this.activeAthlete.Division = -1;
  }

  isNotEmpty(athlete: Athlete) {
    return (
      typeof athlete != 'undefined' && athlete !== null && athlete.isNotEmpty()
    );
  }

  getChampKeyword(callback) {
    this.activatedRouter.params.subscribe((params) => {
      const name = params.name;

      callback(name ?? null);
    });
  }

  async loadCurrentUserAndCheckBlocked() {
    const coach = (await this.authenticationService
      .getCurrentUser()
      .toPromise()) as Coach;

    if (coach.isBlocked) {
      this.translateService
        .get('coach.noPerm')
        .subscribe((noPermissionString: string) => {
          alert(noPermissionString);

          this.router.navigate(['']);
        });
    }

    this.model.fillFromCoach(coach);

    if (this.model.isSuperAdmin) {
      this.SUPER_ADMIN_ID = coach.coachId;
      this.SUPER_ADMIN_NAME = coach.coach;
      // this.model.coachId = null;
      // this.model.branch = null;
    }
  }

  ngAfterViewInit(): void { }

  ngOnChanges() { }

  ngOnDestroy(): void { }

  // async ngOnInit() {
  async ngOnInit() {
    this.getChampKeyword((name) => (this.model.title = name));
    // let lng = localStorage.getItem('lng');
    if (this.model.title) {
      this.homeService._champInfo.subscribe((champInfo) => {
        let tournament = champInfo[1];
        this.teamCompetitionCount = tournament['teamcompetition'];
        this.isCheckQuota = this.teamCompetitionCount > 0;
      });

    }
    await this.loadCurrentUserAndCheckBlocked();
    // await this.loadCoachesByBranch()
    await this.loadAthletes(this.model, null);

    if (this.model.isSuperAdmin) {
      this.allCoaches = Object.values(
        await this.participantsService.getAllCoaches()
      );
      this.allClubs = Object.values(
        await this.participantsService.getAllCoachClubs()
      );
    }
    this.getVideoName();
  }

  async loadAthletes(model: Filter, callback: Function) {
    let coach = model.toParams(this.SUPER_ADMIN_ID);

    this.participantsService.getCoachAth(coach).subscribe((response) => {
      let allParticipants = response as {
        participants: Athlete[];
        not_participants: Athlete[];
      };

      this.participants = Object.values(allParticipants.participants).map(
        (a: Object) => new Athlete(a)
      );


      this.athletes = Object.values(allParticipants.not_participants).map(
        (a: Object) => new Athlete(a)
      );
      //  console.log(this.athletes);


      this.athletesCount = this.athletes.length; //allParticipants.athletesCount;
      this.participantsCount = this.participants.length; //.participantsCount;

      // this.renewActiveAthlete();
      // this.selectAndScrollAthletes(null, this.activeAthlete)

      if (typeof callback == 'function') {
        callback();
      }
    });

    this.translateService.onLangChange.subscribe((event) => {
      this.getVideoName();
    });

  }

  getVideoName() {
    let lng = localStorage.getItem('lng');
    if (lng.toUpperCase() == "UA") {
      this.videofile = "https://www.youtube.com/watch?v=zGDgnStTcoI"
    }
    if (lng.toUpperCase() == "RU") {
      this.videofile = "https://www.youtube.com/watch?v=zGDgnStTcoI"
    }
    if (lng.toUpperCase() == "EN") {
      this.videofile = "https://www.youtube.com/watch?v=MOhmu4EAxHk"
    }

  }

  renewActiveAthlete(): void {
    if (this.isNotEmpty(this.activeAthlete)) {
      this.activeAthlete = this.participants.find(
        (x) => x.athId == this.activeAthlete.athId
      );
    }

    if (this.isNotEmpty(this.activeAthlete)) {
      this.originalAthlete = this.activeAthlete.clone();
    } else {
      this.activeAthlete = new Athlete();
      this.originalAthlete = new Athlete();
    }
  }

  renewSelectedParticipants(): void {
    // this.selectedParticipants = this.selectedParticipants.filter(sp => typeof this.participants.find(p => p.athId == sp.athId) != "undefined")
    this.selectedParticipants = this.selectedAthletes.filter(
      (sa) =>
        typeof this.participants.find((p) => p.athId == sa.athId) != 'undefined'
    );
    // this.selectedParticipants.filter(sp => typeof this.participants.find(p => p.athId == sp.athId) != "undefined")
    this.areAllParticipantsSelected =
      this.participants.length > 0 &&
      this.selectedParticipants.length == this.participants.length;
  }

  synchronizeSelectedAthletesWithSelectedParticipants(): void {
    this.selectedAthletes = this.selectedParticipants.slice();
    this.areAllAthletesSelected =
      this.selectedAthletes.length == this.athletes.length;
  }

  synchronizeSelectedAthletesWithAllAthletes(): void {
    this.selectedAthletes = this.selectedAthletes.filter(
      (sa) =>
        typeof this.athletes.find((p) => p.athId == sa.athId) != 'undefined'
    );
    this.areAllAthletesSelected =
      this.selectedAthletes.length == this.athletes.length;
  }

  synchronizeSelectedarticipantsWithAllParticipants(): void {
    this.selectedParticipants = this.selectedParticipants.filter(
      (sa) =>
        typeof this.participants.find((p) => p.athId == sa.athId) != 'undefined'
    );
    this.areAllParticipantsSelected =
      this.participants.length > 0 &&
      this.selectedParticipants.length == this.participants.length;
  }

  /** private */
  addOrRemoveSelectionOnRowClick($event, userClicked: Athlete): void {
    if ($event != null) {
      $event.stopPropagation();
    }

    if (
      $event &&
      $event.target &&
      $event.target.tagName &&
      $event.target.tagName.toLowerCase() == 'input'
    ) {
      // If checkbox - then  add / remove clicked row to selection
      // deppending on checkbox

      let currentInSelectedAthletes = this.selectedAthletes.find(
        (x) => x.athId == userClicked.athId
      );

      let foundInAthletes =
        typeof currentInSelectedAthletes != 'undefined' &&
        currentInSelectedAthletes != null;

      let currentInSelectedParticipants = this.selectedParticipants.find(
        (x) => x.athId == userClicked.athId
      );

      let foundInParticipants =
        typeof currentInSelectedParticipants != 'undefined' &&
        currentInSelectedParticipants != null;

      if ($event.target.checked) {
        // If checkbox checked -> add clicked row to selection
        if (this.isNotEmpty(userClicked)) {
          if (!foundInAthletes) {
            // Not selected - add to selection
            this.selectedAthletes.push(userClicked);
          }

          if (!foundInParticipants) {
            let currentInParticipants = this.participants.find(
              (x) => x.athId == userClicked.athId
            );

            if (
              typeof currentInParticipants !== 'undefined' &&
              currentInParticipants !== null
            ) {
              this.selectedParticipants.push(userClicked);
            }
          }
        }
      } else {
        // remove clicked row from selection
        if (foundInAthletes) {
          // Selected - remove from selection
          this.selectedAthletes = this.selectedAthletes.filter(
            (x) => x.athId != userClicked.athId
          );
        }

        if (foundInParticipants) {
          // Selected - remove from selection
          this.selectedParticipants = this.selectedParticipants.filter(
            (x) => x.athId != userClicked.athId
          );
        }
      }
    } else {
      // If not checkbox - then clean all selection
      // And take only clicked item as a selection
      if (this.isNotEmpty(userClicked)) {
        this.selectedAthletes = [userClicked];

        let currentInParticipants = this.participants.find(
          (x) => x.athId == userClicked.athId
        );

        if (
          typeof currentInParticipants !== 'undefined' &&
          currentInParticipants !== null
        ) {
          this.selectedParticipants = [userClicked];
        } else {
          this.selectedParticipants = [];
        }
      }
    }

    if (this.selectedAthletes && this.selectedAthletes.length > 0) {
      this.activeAthlete = this.selectedAthletes[0].clone();
      this.originalAthlete = this.activeAthlete.clone();
    } else if (
      this.selectedParticipants &&
      this.selectedParticipants.length > 0
    ) {
      this.activeAthlete = this.selectedParticipants[0].clone();
      this.originalAthlete = this.activeAthlete.clone();
    } else {
      this.activeAthlete = new Athlete();
      this.originalAthlete = new Athlete();
    }

    this.activeAthleteValidationError = null;

    this.areAllParticipantsSelected =
      this.participants.length > 0 &&
      this.selectedParticipants.length == this.participants.length;
    this.areAllAthletesSelected =
      this.selectedAthletes.length == this.athletes.length;
  }

  onAthletesRowClick($event, athleteClicked: Athlete): void {
    this.selectAndScrollParticipants($event, athleteClicked);
  }

  onParticipantsRowClick($event, athleteClicked: Athlete): void {
    this.selectAndScrollAthletes($event, athleteClicked);
  }

  selectAndScrollAthletes($event, current: Athlete): void {
    this.addOrRemoveSelectionOnRowClick($event, current);

    if (this.isNotEmpty(this.activeAthlete)) {
      this.scrollToUserInAllAthletes(
        (user) => user.athId == this.activeAthlete.athId
      );
      // this.scrollToUserInParticipants(user => user.athId == this.activeAthlete.athId)
    }
  }

  selectAndScrollParticipants(event, current: Athlete): void {
    let athlete: Athlete;

    athlete = this.selectedAthletes.find(
      (x) => x.athId == this.activeAthlete.athId
    );

    // if (athlete) {
    //   athlete.current = false;
    // }

    // console.log('Prev', athlete?.FIO, athlete?.current);

    // this.activeAthlete.current = false;
    // console.log('Prev', this.activeAthlete.FIO, this.activeAthlete.current);
    this.addOrRemoveSelectionOnRowClick(event, current);

    // if (event.ctrlKey) {
    //   current.selected = !current.selected;
    // } else {
    //   this.athletes.forEach((athlete) => (athlete.selected = false));
    //   current.selected = true;
    // }

    if (this.isNotEmpty(this.activeAthlete)) {
      // this.scrollToUserInAllAthletes(user => user.athId == this.activeAthlete.athId)
      athlete = this.selectedAthletes.find(
        (x) => x.athId == this.activeAthlete.athId
      );

      this.scrollToUserInParticipants(
        (user) => user.athId == this.activeAthlete.athId
      );
    }
  }

  scrollToUserInParticipants(userToScrollToCondition: Function): number {
    return this.scrollToUser(
      userToScrollToCondition,
      this.participants,
      'selected-participants'
    );
  }

  scrollToUserInAllAthletes(userToScrollToCondition: Function): number {
    return this.scrollToUser(
      userToScrollToCondition,
      this.athletes,
      'all-participants'
    );
  }

  scrollToUser(
    userToScrollToCondition: Function,
    participants: Athlete[],
    rowsNodeId: string
  ): number {
    let index: number = null;

    if (participants) {
      participants.find((x, i) => {
        let found = userToScrollToCondition(x);

        // if (found && index == null) {
        //   index = i;
        // }
        if (found && index == null) {
          index = i;
        }
      });

      if (index !== null) {
        // Это для пагинации
        let idx = index - (this.searchPage - 1) * this.pageSize - 1;
        if (idx < 0) {
          idx = 0;
        }

        var rows = document.querySelectorAll('#all-participants .row');
        // let bScroll = this.searchPage > 1 && idx > 0;
        // let bScroll = this.searchPage > 1;

        if (rows[idx]) {
          rows[idx].scrollIntoView({ block: 'start' });
        }
      }
    }

    return index;
  }

  insertNewAth(): void {

    this.activeAthlete = new Athlete();
    this.originalAthlete = new Athlete();

    this.submitted = false;
    this.activeAthleteValidationError = null;
    let el = document.getElementById('fio');
    el.focus();


    // this.model.filters.findByName = this.activeAthlete.FIO;
    // this.findByName();

    // if (this.searchedIndex == null) {
    //   this.activeAthlete = new Athlete();
    //   this.activeAthlete.FIO = `New Athlete ${this.model.coachId}`;
    //   this.activeAthlete.dateBR = '2000-01-01';
    //   this.activeAthlete.DAN = Dan.K0;
    //   this.activeAthlete.gender = Gender.MALE;
    //   this.activeAthlete.Weight = 35.0;
    //   this.activeAthlete.Kumite = true;
    //   this.submitted = false;
    //   this.activeAthleteValidationError = null;
    //   this.updateAth();     
    // }


    // this.originalAthlete = new Athlete();

  }

  async deleteAth() {
    if (this.selectedAthletes && this.selectedAthletes.length > 0) {
      let fios = this.selectedAthletes.reduce(
        (selectedFio, user, index) =>
          selectedFio +
          user.FIO +
          (index != this.selectedAthletes.length - 1 ? ', \n' : ''),
        ''
      );

      this.translateService
        .get('coach.askDeleteAth', { user: fios })
        .subscribe((askDeleteAthleteQuestion: string) => {
          const confirmed = confirm(askDeleteAthleteQuestion);

          if (confirmed) {
            let deleteAthleteParams = {
              title: this.model.title,
              athIds: this.selectedAthletes.map((user) => user.athId),
            };

            this.participantsService
              .deleteAth(deleteAthleteParams)
              .subscribe((response) => {
                this.loadAthletes(this.model, null);
              });
            this.activeAthlete.FIO = '';
          }
        });
    }
  }

  validate(user: Athlete): AthleteValidation | false {
    let isUser = typeof user != 'undefined' && user != null;

    let activeAthleteValidationError = {
      FIO: !(isUser && user.FIO != null && user.FIO != ''),
      dateBR: !(isUser && user.dateBR != null && user.dateBR != ''),
      gender: !(isUser && user.gender != null),
      // Weight: !(isUser && user.Weight != null && user.Weight != ""),
      DAN: !(isUser && user.DAN != null),
    };

    if (
      activeAthleteValidationError.FIO == false &&
      activeAthleteValidationError.dateBR == false &&
      activeAthleteValidationError.gender == false &&
      // activeAthleteValidationError.Weight == false &&
      activeAthleteValidationError.DAN == false
    ) {
      return false;
    }

    return activeAthleteValidationError;
  }

  async updateAth() {
    this.submitted = true;
    this.activeAthleteValidationError = this.validate(this.activeAthlete);

    if (!this.activeAthleteValidationError) {
      if (this.isNotEmpty(this.activeAthlete)) {
        let athleteParams: Athlete = this.activeAthlete.clone();

        athleteParams.title = this.model.title;
        athleteParams.coachId = this.model.coachId;

        if (athleteParams.photo_bytes) {
          athleteParams.photo_bytes = athleteParams.photo_bytes.replace(
            /^data:(.*,)?/,
            ''
          );
        }

        // If user is being edited
        if (athleteParams.athId) {
          this.participantsService.updateAth(athleteParams).subscribe(
            (response) => this.processUpteteAthServerResponse(),
            (error) => this.onErrorAdd(error)
            // this.processServerErrors(error)
          );
        } else {
          // If user is being created
          if (this.model.coachId) {
            this.participantsService.insertNewAth(athleteParams).subscribe(
              (response) => {
                if (response && (response as any).athId) {
                  this.activeAthlete.athId = (response as any).athId;
                  this.processUpteteAthServerResponse();
                }
              },
              (error) =>
                this.onErrorAdd(error)
              // this.processServerErrors(error)
            );
          }
        }
      }
    }
  }

  onErrorAdd(error) {
    // this.model.filters.findByName = this.activeAthlete.FIO;
    // this.findByName();
    // console.log(this.athletes);

    // this.clearSearch();
    this.processServerErrors(error);
  }

  processUpteteAthServerResponse(): void {
    this.originalAthlete = this.activeAthlete.clone();

    this.loadAthletes(this.model, () => {
      this.selectAndScrollAthletes(null, this.activeAthlete);
    });

    this.submitted = false;
  }

  processServerErrors(errorWrapepr): void {
    if (errorWrapepr instanceof HttpErrorResponse) {
      if (errorWrapepr.status === 422) {
        console.log('422');

        // TODO: extract errors here and match onto the form
        if (errorWrapepr.error) {
          if (errorWrapepr.error.athlete == 'exists') {
            this.activeAthleteValidationError = {
              FIO: 'exists',
              dateBR: true,
            };
          }
        }

        // errorWrapepr.error.map(
        //     e => Object.keys(e).map(
        //         field => {
        //             const formControl = this.registerForm.get(field);

        //             let err = {};
        //             err[e[field]] = true

        //             formControl.setErrors(err)
        //         }
        //     )
        // )
      } else {
        // this.unexpectedError = true
      }
    } else {
      // this.unexpectedError = true
    }
  }

  cleanErrors(): void {
    this.activeAthleteValidationError = null;
    this.submitted = false;
  }

  getDateSting(dateString: string): string {
    let d = new Date();

    d.setTime(Date.parse(dateString));

    return d.toLocaleDateString();
  }

  async moveToParticipantList() {
    if (this.model.coachId && this.athletes && this.athletes.length > 0) {
      let athletes = {
        title: this.model.title,
        athIds: this.selectedAthletes.map((a) => a.athId),
      };

      await this.participantsService.moveToParticipantList(athletes);

      await this.loadAthletes(this.model, () => {
        this.renewSelectedParticipants();
      });
    }
  }

  async deleteFromParticipantList() {
    if (
      this.model.coachId &&
      this.selectedParticipants &&
      this.selectedParticipants.length > 0
    ) {
      let fios = this.selectedParticipants.reduce(
        (selectedFio, user, index) =>
          selectedFio +
          user.FIO +
          (index != this.selectedParticipants.length - 1 ? ', \n' : ''),
        ''
      );

      this.translateService
        .get('coach.askDeletePart', { user: fios })
        .subscribe((res: string) => {
          const answer = confirm(res);

          if (answer) {
            let athletes = {
              title: this.model.title,
              athIds: this.selectedParticipants.map((p) => p.athId),
            };

            this.participantsService
              .deleteFromParticipantList(athletes)
              .subscribe((result) => {
                this.loadAthletes(this.model, () => {
                  this.renewSelectedParticipants();
                });
              });
          }
        });
    }
  }

  async clearParticipantList() {
    if (this.model.coachId && this.model.title) {
      this.translateService.get('coach.askClear').subscribe((res: string) => {
        const answer = confirm(res);

        if (answer) {
          this.participantsService
            .clearParticipantList(this.model)
            .subscribe((result) => {
              this.loadAthletes(this.model, () => {
                this.renewSelectedParticipants();
              });
            });
        }
      });
    }
  }

  // async chooseList(event) {
  //     await this.loadAthletes(this.model, null);
  // }

  async chooseGender(event) {
    await this.loadAthletes(this.model, () => {
      // this.loadAthletes(this.model, () => {
      this.synchronizeSelectedarticipantsWithAllParticipants();
      this.synchronizeSelectedAthletesWithAllAthletes();
    });
  }

  public findByName(): void {
    if (this.model.filters.findByName) {
      this.page = 1;
      this.searchedIndex = this.scrollToUserInAllAthletes((x) =>
        x.FIO.toLowerCase().includes(
          this.model.filters.findByName.toLowerCase()
        )
      );

      if (this.athletes && this.searchedIndex != null) {
        if (this.searchedIndex % this.pageSize == 0) {
          this.searchPage = Math.round(this.searchedIndex / this.pageSize);
        } else {
          this.searchPage = Math.ceil(this.searchedIndex / this.pageSize);
        }

        if (this.searchPage < 0) {
          this.searchPage = 1;
          this.searchedIndex = 0;
        }

        this.selectAndScrollAthletes(null, this.athletes[this.searchedIndex]);
        this.page = this.searchPage;
      }
    } else {
      this.clearSearch();
    }
  }

  async select() {
    await this.loadAthletes(this.model, null);
    // this.loadAthletes(this.model, null);
  }

  setAllKumite(select: boolean): void {
    if (this.model?.title && this.model?.coachId) {
      this.participantsService
        .setAllKumite({
          set: select,
          title: this.model?.title,
          coachId: this.model?.coachId,
        })
        .subscribe((response) => {
          this.loadAthletes(this.model, () => {
            this.renewActiveAthlete();
          });
        });
    }
  }

  setAllKata(select: boolean): void {
    if (this.model?.title && this.model?.coachId) {
      this.participantsService
        .setAllKata({
          set: select,
          title: this.model?.title,
          coachId: this.model?.coachId,
        })
        .subscribe((response) => {
          this.loadAthletes(this.model, () => {
            this.renewActiveAthlete();
          });
        });
    }
  }

  onChangeKumite(): void {
    this.activeAthlete.Kumite = !this.activeAthlete.Kumite;

    if (
      this.isNotEmpty(this.activeAthlete) &&
      typeof this.activeAthlete.athId != 'undefined'
    ) {
      this.updateAth();
    }
  }

  onChangeKata(): void {
    this.activeAthlete.Kata = !this.activeAthlete.Kata;

    if (
      this.isNotEmpty(this.activeAthlete) &&
      typeof this.activeAthlete.athId != 'undefined'
    ) {
      this.updateAth();
    }
  }

  onChangeKataGroup(): void {
    this.activeAthlete.KataGroup = !this.activeAthlete.KataGroup;

    if (
      this.isNotEmpty(this.activeAthlete) &&
      typeof this.activeAthlete.athId != 'undefined'
    ) {
      this.updateAth();
    }
  }

  onChangeFavorit1(): void {
    this.activeAthlete.Favorit1 = !this.activeAthlete.Favorit1;

    if (
      this.isNotEmpty(this.activeAthlete) &&
      typeof this.activeAthlete.athId != 'undefined'
    ) {
      this.updateAth();
    }
  }

  onChangeFavorit2(): void {
    this.activeAthlete.Favorit2 = !this.activeAthlete.Favorit2;

    if (
      this.isNotEmpty(this.activeAthlete) &&
      typeof this.activeAthlete.athId != 'undefined'
    ) {
      this.updateAth();
    }
  }

  onChangecompetition() {
    this.activeAthlete.teamcompetition = !this.activeAthlete.teamcompetition;
    let error;
    if (this.activeAthlete.teamcompetition) {
      if (!this.checkCompetition()) {
        this.translateService
        .get('coach.errorcompetition')
        .subscribe((res: string) => {
          error = res;
        });
    
        alert(error)
        // this.activeAthlete.teamcompetition = false;
        return;
      }
    }

    if (
      this.isNotEmpty(this.activeAthlete) &&
      typeof this.activeAthlete.athId != 'undefined'
    ) {
      this.updateAth();
    }

  }

  checkCompetition() {

    if (!this.isCheckQuota) {
      return true;
    };
    const result = this.participants?.reduce((acc, currItem) => {
      if (currItem.teamcompetition) {
        acc += 1
      }
      return acc;
    }, 0);

    return result < this.teamCompetitionCount;
  }

  async onPhotoChange(event) {
    // 100 kb
    const FILE_MAX_SIZE = 100000;
    let file = event.target.files[0];

    if (file.size > FILE_MAX_SIZE) {
      this.translateService
        .get('coach.fileToBig')
        .subscribe((fileToBigString: string) => {
          alert(fileToBigString);
        });
    } else {
      let imgUrl = (await this.getBase64(file)) as any;

      this.activeAthlete.photo_bytes = imgUrl; //.replace(/^data:(.*,)?/, '');

      this.activeAthlete.Photo = event.target.files[0]['name'];
      this.updateAth();
    }
  }

  async onSelectChange() {
    if (!this.activeAthlete.Division) { this.activeAthlete.Division = -1 }
    // console.log(this.activeAthlete.Division);

    this.updateAth();
  }

  private getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  eligibleToMoveToParticipants(): boolean {
    return this.selectedAthletes.length !== this.selectedParticipants.length;
  }

  eligibleToMoveToParticipant(athlete: Athlete): boolean {
    let result = this.participants.find((x) => x.athId == athlete.athId);

    return typeof result != 'undefined' && result != null;

    // let result = this.participants.filter(
    //   (item) => item.athId === current.athid
    // );
    // let result = this.participants.find(
    //   (item) => (item.athId = current?.athid)
    // );
    // console.log(result);
    // return false;
    // // return result.length > 0;
  }

  eligibleToDeleteFromParticipants(): boolean {
    return this.selectedParticipants && this.selectedParticipants.length > 0;
  }

  isAthleteDataChanged(): boolean {
    return !this.activeAthlete.dataEquals(this.originalAthlete);
  }

  eligibleToBeUpdated(): boolean {
    return this.isAthleteDataChanged();
  }

  eligibleToAddNew(): boolean {
    return (
      this.model &&
      this.model.coachId &&
      ((this.model.isSuperAdmin &&
        this.model?.coachId != this.SUPER_ADMIN_ID) ||
        !this.model.isSuperAdmin)
    );
  }

  isSelectedAthlete(athlete: Athlete): boolean {
    athlete = this.selectedAthletes.find((x) => x.athId == athlete.athId);

    return typeof athlete != 'undefined' && athlete != null;
  }

  isSelectedParticipant(participant: Athlete): boolean {
    participant = this.selectedParticipants.find(
      (x) => x.athId == participant.athId
    );

    return typeof participant != 'undefined' && participant != null;
  }

  selectAllParticipants(event): void {
    this.areAllParticipantsSelected = !this.areAllParticipantsSelected;

    if (this.areAllParticipantsSelected) {
      this.selectedParticipants = this.participants.slice();
    } else {
      this.selectedParticipants = [];
    }

    this.synchronizeSelectedAthletesWithSelectedParticipants();
    this.selectAndScrollAthletes(null, null);
  }

  selectAllAthletes(event, index): void {
    this.areAllAthletesSelected = !this.areAllAthletesSelected;

    if (this.areAllAthletesSelected) {
      this.selectedAthletes = this.athletes.slice();
    } else {
      this.selectedAthletes = [];
    }

    // this.renewSelectedParticipants();
    // this.selectAndScrollParticipants(null, null);
  }

  clearSearch() {
    this.model.filters.findByName = '';
    this.searchPage = 1;
    this.page = 1;
    this.selectAndScrollAthletes(null, this.athletes[0]);
    this.page = this.searchPage;
    this.page = 1;
    // this.onInputSearch();
  }

  onShowRole() {
    this.isShowRole = !this.isShowRole;
  }

  onPageChange(event: PageChangedEvent) {
    this.page = event.page;
    this.startItem = (event.page - 1) * event.itemsPerPage;
  }

  onGetTotal() {
    return this.athletes?.length;
  }

  handlePageEvent(e: PageEvent) {
    this.pageEvent = e;
    this.length = e.length;
    this.pageSize = e.pageSize;
    this.pageIndex = e.pageIndex;
  }

  setPageSizeOptions(setPageSizeOptionsInput: string) {
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput
        .split(',')
        .map((str) => +str);
    }
  }

  formatWeight(weight) {
    return 0.0;
  }
}
