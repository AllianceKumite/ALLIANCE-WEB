import { Component,  ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TournamentService } from '../../services/tournament.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { ReferyValidation } from '../../models/refery.validation';
import { Refery, Gender, GenderOption, Dan, DanOption, Filter, Coach } from '../../models/refery';
import { HomeService } from 'src/app/shared/services/home.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { AuthenticationService } from '../../../shared/services/authentication.service';
import { RegreferyService } from '../regrefery/service/regrefery.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-regrefery',
  templateUrl: './regrefery.component.html',
  styleUrls: ['./regrefery.component.css']
})

export class RegreferyComponent {
  @ViewChild('registrationCountrySelector') countrySelector: NgSelectComponent;
  @ViewChild('registrationClubSelector') clubSelector: NgSelectComponent;

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

  referys: Refery[] = [];
  champName: string;

  flagDir: string = `${environment.mediaDir}/logos`;

  model = new Filter();

  filter: any = {
    title: null
  }
  submitted: boolean = false;
  activeReferyValidationError: ReferyValidation | false = null;
  activeRefery = new Refery();
  originalRefery = new Refery();
  countries: any[] = [];
  clubs: any[] = [];

  // registerForm: FormGroup;

  lng: string;
  selectedCountry: number;
  selectedRegion;
  selClub: number;

  SUPER_ADMIN_ID;
  SUPER_ADMIN_NAME;
  
  videofile;
  readonly logosDir: string = `${environment.logosDir}`;

  constructor(
    private tournamentService: TournamentService,
    private activatedRouter: ActivatedRoute,
    private homeService: HomeService,
    private translateService: TranslateService,
    private router: Router,
    private authenticationService: AuthenticationService,
    private regreferyservice : RegreferyService,

  ) {

  }

  async ngOnInit() {

    this.getChampKeyword((name) => (this.filter.title = name));
    await this.loadCurrentUserAndCheckBlocked();

    this.lng = this.defineLng();
    this.loadCountries();
    await this.loadClubs(this.selectedRegion, this.selectedCountry, this.lng);

    this.activatedRouter.parent.params.subscribe(params => {
      this.champName = params["name"];
      this.model.title = this.champName
    });

    this.loadreferys();
    this.getVideoName();
   
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
    }
  }


  getChampKeyword(callback) {
    this.activatedRouter.params.subscribe((params) => {
      const name = params.name;

      callback(name ?? null);
    });
  }

  insertNewRefery(): void {
    this.activeRefery = new Refery();
    this.originalRefery = new Refery();

    this.submitted = false;
    this.activeReferyValidationError = null;
    let el = document.getElementById('fio');
    el.focus();

  }

  getVideoName(){
    let lng = localStorage.getItem('lng');
    if (lng.toUpperCase() == "UA") { 
      this.videofile = "https://www.youtube.com/watch?v=y35SOKbqYVU" 
    }
    if (lng.toUpperCase() == "RU") { 
      this.videofile = "https://www.youtube.com/watch?v=y35SOKbqYVU" 
    }
    if (lng.toUpperCase() == "EN") { 
      this.videofile = "https://www.youtube.com/watch?v=ElyzSwUco1M" 
    }

  }

  async saveNewRefery() {
    this.submitted = true;
    this.activeReferyValidationError = this.validate(this.activeRefery);

    if (!this.activeReferyValidationError) {
     
      if (this.isNotEmpty(this.activeRefery)) {
        let referyParams: Refery = this.activeRefery.clone();

        // referyParams.FIO = this.model.title;
        referyParams.title = this.champName;
        referyParams.coachId = this.model.coachId;
        
          // If user is being edited
          if (referyParams.ReferyId) {
            this.regreferyservice.updateRefery(referyParams).subscribe(
              (response) => this.processUpteteAthServerResponse(),
              (error) => this.onErrorAdd(error)
            );
          } else {
            // If user is being created
            
            if (this.model.coachId) {
              this.regreferyservice.insertNewRefery(referyParams).subscribe(
                (response) => {
                  
                  if (response && (response as any).referyId) {
                    this.activeRefery.ReferyId = (response as any).referyId;
                    this.processUpteteAthServerResponse();
                  }
                },
                (error) =>
                  this.onErrorAdd(error)
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

  processServerErrors(errorWrapepr): void {
    if (errorWrapepr instanceof HttpErrorResponse) {
      if (errorWrapepr.status === 422) {

        if (errorWrapepr.error) {
          if (errorWrapepr.error.refery == 'exists') {
            this.activeReferyValidationError = {
              FIO: 'exists'
            };
          }
        }
      } else {
        // this.unexpectedError = true
      }
    } else {
      // this.unexpectedError = true
    }
  }


  isNotEmpty(refery: Refery): boolean{
    let result;
    result = typeof refery != 'undefined' && refery !== null && refery.isNotEmpty();
    // result = typeof refery != 'undefined' && refery !== null;

    return result;
  }


  validate(refery: Refery): ReferyValidation | false {
    let isUser = typeof refery != 'undefined' && refery != null;

    let activeReferyValidationError = {
      FIO: !(isUser && refery.FIO != null && refery.FIO != ''),
      gender: !(isUser && refery.Gender != null),
      DAN: !(isUser && refery.DAN != null),
      DateBR: !(isUser && refery.DateBR != null),
    };

    if (
      activeReferyValidationError.FIO == false &&
      activeReferyValidationError.gender == false &&
      activeReferyValidationError.DAN == false &&
      activeReferyValidationError.DateBR == false
    ) {
      return false;
    }

    return activeReferyValidationError;
  }

  async onSelectRefery($event, current: Refery) {
    this.cleanErrors();
    this.activeRefery = new Refery();
    this.activeRefery.FIO = current.FIO;
    this.activeRefery.DateBR = current.DateBR;
    this.activeRefery.DAN = current.DAN;
    this.activeRefery.Gender = current.Gender;
    this.activeRefery.ReferyId = current.ReferyId;
    this.activeRefery.coachId = current.coachId;
    this.activeRefery.countryId = current.countryId;
  }


  defineLng() {
    let lng = localStorage.getItem('lng');

    if (lng && lng.length > 1) {
      lng = lng[0].toUpperCase() + lng.slice(1);
    }

    return lng;
  }


  loadCountries() {
    this.homeService.getAllCountries().subscribe((response) => {
      this.countries = Object.values(response);
    });
  }

  async loadClubs(region, country, lng) {
    this.homeService.getAnyClubs().subscribe((response) => {
      this.clubs = Object.values(response);
    });
  }


  deleteRefery(): void {
    if (this.activeRefery && this.activeRefery.FIO.length > 0) {

      this.translateService
        .get('referyTable.askDeleteRefery', { user: this.activeRefery.FIO })
        .subscribe((askDeleteReferyQuestion: string) => {
          const confirmed = confirm(askDeleteReferyQuestion);

          if (confirmed) {
            let deleteReferyParams = {
              title: this.model.title,
              referyId: this.activeRefery.ReferyId,
            };

            this.regreferyservice
              .deleteRefery(deleteReferyParams)
              .subscribe((response) => {
                this.loadreferys();
              });
            this.activeRefery.FIO = '';
          }
        });
    }

  }

  isSelectedRow(refery): boolean {
    return true
  }

  cleanErrors(): void {
      this.activeReferyValidationError = null;
      this.submitted = false;
  }

  onSelectChange(): void {

  }

  loadreferys(){
    let coach = this.model.toParams(this.SUPER_ADMIN_ID);
    this.tournamentService.getReferysCoach(coach).subscribe((response: any) => {
      this.referys = Object.values(response.referys);          
    });

  }
  processUpteteAthServerResponse(): void {
    this.originalRefery = this.activeRefery.clone();
   
    this.loadreferys();

    this.submitted = false;
  }


}
