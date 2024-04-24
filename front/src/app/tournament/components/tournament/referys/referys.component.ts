import { TournamentService } from 'src/app/tournament/services/tournament.service';
import { Refery, Gender, GenderOption, Dan, DanOption } from '../../../models/refery';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HomeService } from 'src/app/shared/services/home.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-referys',
  templateUrl: './referys.component.html',
  styleUrls: ['./referys.component.css']
})
export class ReferysComponent {
  champName: string;
  isMobileView: boolean = false;
  referys: Refery[] = [];
  lng: string;
  countries: any[] = [];
  clubs: any[] = [];

  selectedRegion: number;
  selectedCountry: number;

  filter: any = {
    title: null
  }
  flagDir: string = `${environment.mediaDir}/logos`;

  constructor(
    private tournamentService: TournamentService,
    private activatedRouter: ActivatedRoute,
    private homeService: HomeService,
    private translateService: TranslateService,

  ) {

  }

  async ngOnInit() {
    this.lng = this.defineLng();
    this.loadCountries();
    await this.loadClubs(this.selectedRegion, this.selectedCountry, this.lng);

    // this.loadClubs(null, null, this.lng);

    this.activatedRouter.parent.params.subscribe(params => {
      this.champName = params["name"];
      this.filter = {
        title: this.champName,
      };
    });

    this.tournamentService.getReferys(this.filter).subscribe((response: any) => {
      this.referys = Object.values(response.referys);

    });

  }

  getSushin(sushin) {
    let nSushin = Number(sushin);
    let result = '';
    switch (nSushin) {
      case 0:
        result = 'FU'
        break;
      case 1:
        result = 'SH1'
        break;
      case 2:
        result = 'SH2'
        break;
      case 3:
        result = 'SH3'
        break;
      case 4:
        result = 'SH4'
        break;
    }
    return result;
  }

  defineLng() {
    let lng = localStorage.getItem('lng');

    if (lng && lng.length > 1) {
      lng = lng[0].toUpperCase() + lng.slice(1);
    }

    return lng;
  }

  getName(refery): string {
    this.lng = this.defineLng();
    let name: string = '';

    if (this.lng.toUpperCase() == 'UA') {
      name = refery?.countryNameUa;
    }

    if (this.lng.toUpperCase() == 'RU') {
      name = refery?.countryNameRu;
    }

    if (this.lng.toUpperCase() == 'EN') {
      name = refery?.countryNameEn;
    }
    return name;
  }


  loadCountries() {
    this.homeService.getAllCountries().subscribe((response) => {
      this.countries = Object.values(response);
    });
  }

  async loadClubs(region, country, lng) {
    this.homeService.getAllClubs({ region, country, lng }).subscribe((response) => {
      // this.homeService.getAnyClubs().subscribe((response) => {
      this.clubs = Object.values(response);
    });
  }

}
