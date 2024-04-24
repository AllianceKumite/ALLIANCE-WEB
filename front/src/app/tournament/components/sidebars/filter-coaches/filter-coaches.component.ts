import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Countries } from './../../../models/countries.model'
import { TournamentService } from './../../../services/tournament.service'

// TODO: move common filter logic to one place
// Unused
@Component({
  selector: 'filter-coaches',
  templateUrl: './filter-coaches.component.html',
  styleUrls: ['./filter-coaches.component.css']
})
export class FilterCoachesComponent implements OnInit {
  nameOfChampionship: string;

  filter: any = {
    title: null,
    lng: null
  }

  items: any[];

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

    this.tournamentService.getCoaches(this.filter).subscribe(response => {
      this.items = Object.values(response);
    });
  }

  filterParticipants(event) {
    if (this.nameOfChampionship) {
      this.router.navigate(['champ/' + this.nameOfChampionship + '/participants'], { queryParams: { 'coach': event } });
      window.scrollTo(0, 0);
    }
  }
}
