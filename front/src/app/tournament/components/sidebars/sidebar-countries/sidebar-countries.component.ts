import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Countries } from './../../../models/countries.model'
import { TournamentService } from './../../../services/tournament.service';

// unused
@Component({
  selector: 'app-sidebar-countries',
  templateUrl: './sidebar-countries.component.html',
  styleUrls: ['./sidebar-countries.component.css']
})
export class SidebarCountriesComponent implements OnInit {
  nameOfChampionship: string;

  filter: any = {
    title: null,
    lng: null
  }

  countries: Countries[];

  readonly logosDir: string = `${environment.logosDir}`;

  constructor(
    private router: Router,
    private tournamentService: TournamentService,
    private activatedRouter: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.activatedRouter.parent.params.subscribe(params => {
      const result = params["name"];
      this.filter = {
        title: result,
        lng: localStorage.getItem('lng') || 'Ua'
      };
    });

    this.activatedRouter.paramMap.subscribe(param => {
      const name = param["params"]["name"];
      this.nameOfChampionship = name;
    });

    this.tournamentService.getCountries(this.filter).subscribe(response => {
      this.countries = Object.values(response);
    });
  }

  getParticipantsByCountry(event) {
    if (this.nameOfChampionship) {
      this.router.navigate(['champ/' + this.nameOfChampionship + '/participants'], { queryParams: { 'country': event } });
      window.scrollTo(0, 0);
    }
  }
}
