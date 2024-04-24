import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environments/environment';
import { ValidatePassowrds, customPasswordValidator } from './../helpers/validatePassword'
import { Registration } from './../../shared/models/registration'
import { User } from './../../shared/models/user';
import { AuthenticationService } from './../../shared/services/authentication.service';
import { HomeService } from './../../shared/services/home.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent implements OnInit {
  @ViewChild('registrationCountrySelector') countrySelector: NgSelectComponent;

  REDIRECT_TIMEOUT = 5000;

  registeredSuccessfully: boolean = false;
  submitted: boolean = false;

  selectedCountry;
  selectedRegion;
  selectedCity;
  selectedClub;
  selectedOrganization;
  selectedBranch;

  isMobileView: boolean = false;
  readonly logosDir: string = `${environment.logosDir}`;

  unexpectedError: boolean = false;

  countries: any[] = [];
  regions: any[] = [];
  cities: any[] = [];
  clubs: any[] = [];
  organizations: any[] = [];
  branches: any[] = [];

  currentUser$: Observable<User>;

  private fb: FormBuilder;
  registerForm: FormGroup;

  newClub: any;
  lng: any;

  coachId: any = null;
  coachById: any = null;

  changePassword: boolean = false;
  newUser: boolean = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,

    private homeService: HomeService,
    private authenticationService: AuthenticationService,
    private translateService: TranslateService,
    private _fb: FormBuilder,
    private location: Location
  ) {
    this.fb = _fb;
  }

  async ngOnInit() {
    this.isMobileView = window.screen.width < 990;
    this.lng = this.defineLng();

    this.setUpRegistrationForm();

    this.loadCountries();
    this.loadRegions(this.selectedCountry, this.lng);
    this.loadCities(this.selectedRegion, this.selectedCountry, this.lng);
    this.loadClubs(this.selectedRegion, this.selectedCountry, this.lng);
    this.loadOrganizations();
    this.loadBranches();

    this.loadEditedCoach();
  }

  get f() {
    return this.registerForm.controls;
  }

  loadEditedCoach() {
    this.newUser = false;
    this.activatedRoute.params.subscribe(async (paramMap) => {
      this.coachId = isNaN(paramMap.id) ? null : +paramMap.id;
        if (this.coachId !== null) {
            this.homeService
                .getCoachById(this.coachId, this.defineLng())
                .subscribe((response) => {
                    this.coachById = response;

                    this.fillFormWithValues(this.coachById);
                });
        } else { 
            this.newUser = true;
        }
    });
  }

  defineLng() {
    let lng = localStorage.getItem('lng');

    if (lng && lng.length > 1) {
      lng = lng[0].toUpperCase() + lng.slice(1);
    }

    return lng;
  }

  setUpRegistrationForm() {
    this.registerForm = this.fb.group(
      {
        username: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required, Validators.email]),
        country: new FormControl(null, [Validators.required]),
        region: new FormControl(null, []),
        city: new FormControl(null, []),
        club: new FormControl(null, []),
        // city: new FormControl(null, [Validators.required]),
        // club: new FormControl(null, [Validators.required]),
        organization: new FormControl(null, [Validators.required]),
        branch: new FormControl(null, []),
        // password: new FormControl('', [Validators.required]),
        // confirmPassword: new FormControl('', [Validators.required]),

        password: new FormControl('', [
          customPasswordValidator(() => !this.coachId),
        ]),
        confirmPassword: new FormControl('', [
          customPasswordValidator(() => !this.coachId),
        ]),
      },
      {
        validator: ValidatePassowrds('password', 'confirmPassword'),
      }
    );
  }

  fillFormWithValues(coach) {
    if (coach) {
      this.registerForm.controls.username.setValue(coach.username);
      this.registerForm.controls.email.setValue(coach.email);
      // this.registerForm.controls.country.setValue(coach.country);
      this.selectedCountry = coach.country;
      // this.translateService.get("db.country." + coach.country).subscribe(
      //     txt => this.selectedCountry = txt
      // )

      this.selectedRegion = coach.region;
      // if (coach.region) {
      //     this.translateService.get("db.region." + coach.region).subscribe(
      //         txt => this.selectedRegion = txt
      //     )
      // }

      // this.translateService.get("db.region." + coach.region).subscribe(
      //     txt => this.selectedRegion = txt
      // )

      // this.selectedCountry = {id: this.coachById.country};
      // this.registerForm.controls.region.setValue(coach.region);

      this.selectedCity = coach.city;
      this.selectedClub = coach.club;
      this.selectedOrganization = coach.organization;
      this.selectedBranch = coach.branch;
      // this.registerForm.controls.club.setValue(coach.club);
      // this.registerForm.controls.city.setValue(coach.city);
      // this.registerForm.controls.organization.setValue(coach.organization);
      // this.registerForm.controls.branch.setValue(coach.branch);

      // this.registerForm.controls.password.setValue(coach.password);
    }
  }

  collectFormValues() {
    let model = {
      lng: this.defineLng(),
      username: this.f.username.value,
      email: this.f.email.value,
      country: this.f.country.value,
      region: this.f.region.value?.regionId || this.f.region.value,
      club: this.f.club.value?.clubId || this.f.club.value,
      city: this.f.city.value?.cityId || this.f.city.value,
      organization:
        this.f.organization.value?.orgId || this.f.organization.value,
      branch: this.f.branch.value,
      password: this.f.password.value,
      confirmPassword: this.f.confirmPassword.value,
      coachId: this.coachId !== null ? this.coachId : null,
    };

    return model;
  }

  /**
   * Register or update profile
   */
  doRegister() {
    this.touchForm();

    this.submitted = true;

    if (!this.registerForm.invalid) {
      let model = this.collectFormValues();

      this.authenticationService.register(model).subscribe(
        (response) => {
          this.registeredSuccessfully = true;

          if (this.coachId == null) {
            setTimeout(() => {
              this.goToLoginPage();
            }, this.REDIRECT_TIMEOUT);
          } else {
            this.location.back();
          }
        },
        (e) => this.processServerErrors(e)
      );
    }
  }

  goToLoginPage() {
    // TODO: Why doesn't redirect? :/
    this.router.navigate(['login']);
  }

  processServerErrors(error) {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 422) {
        // TODO: extract errors here and match onto the form

        error.error.map((e) =>
          Object.keys(e).map((field) => {
            const formControl = this.registerForm.get(field);

            let err = {};
            err[e[field]] = true;

            formControl.setErrors(err);
          })
        );
      } else {
        this.unexpectedError = true;
      }
    } else {
      this.unexpectedError = true;
    }
  }

  private touchForm() {
    this.f['username'].markAsTouched();
    this.f['email'].markAsTouched();
    this.f['country'].markAsTouched();
    this.f['region'].markAsTouched();
    this.f['club'].markAsTouched();
    this.f['city'].markAsTouched();
    this.f['organization'].markAsTouched();
    this.f['branch'].markAsTouched();
    this.f['password'].markAsTouched();
    this.f['confirmPassword'].markAsTouched();
  }

  loadCountries() {
    this.homeService.getAllCountries().subscribe((response) => {
      this.countries = Object.values(response);
    });
  }

  loadRegions(country, lng) {
    this.homeService.getAllRegions({ country, lng }).subscribe((response) => {
      this.regions = Object.values(response);
    });
  }

  async loadCities(region, country, lng) {
    const cities = await this.homeService.getAllCities({
      region,
      country,
      lng,
    });

    this.cities = Object.values(cities);
  }

  async loadClubs(region, country, lng) {
    this.homeService
      .getAllClubs({ region, country, lng })
      .subscribe((response) => {
        this.clubs = Object.values(response);
      });
  }

  loadOrganizations() {
    this.homeService.getAllOrganization().subscribe((response) => {
      this.organizations = Object.values(response);
    });
  }

  async loadBranches() {
    const branches = await this.homeService.getAllBranch();
    this.branches = Object.values(branches);
  }

  onCountrySelect(country) {
    this.loadRegions(country, this.lng);
    // this.loadCities(this.selectedRegion ? this.selectedRegion.regionId : null, country)
    this.loadCities(this.selectedRegion, country, this.lng);
    this.loadClubs(this.selectedRegion, country, this.lng);
  }

  onRegionSelect(region) {
    this.loadCities(region.regionId, this.selectedCountry, this.lng);
    this.loadClubs(region.regionId, this.selectedCountry, this.lng);
  }

  onRegionBlur(region) {}

  blurCountries() {}

  onChangePassword() {
    this.changePassword = !this.changePassword;
  }
}
