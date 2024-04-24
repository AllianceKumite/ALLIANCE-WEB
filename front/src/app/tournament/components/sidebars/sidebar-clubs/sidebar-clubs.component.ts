import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { TournamentService } from '../../../services/tournament.service';

// Unused
@Component({
  selector: 'sidebar-clubs',
  templateUrl: './sidebar-clubs.component.html',
  styleUrls: ['./sidebar-clubs.component.css']
})
export class SidebarClubsComponent implements OnInit {
  nameOfChampionship: string;

  filter: any = {
    title: null
  }

  clubs: any;

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
        lng: "ru"
      };
    });

    this.activatedRouter.paramMap.subscribe(param => {
      const name = param["params"]["name"];
      this.nameOfChampionship = name;
    });

    this.tournamentService.getClubs(this.filter).subscribe(response => {
      this.clubs = Object.values(response);
      console.log('sidebar',this.clubs);
      
    });
  }

  getParticipantsByClub(event) {
    if (this.nameOfChampionship) {
      this.router.navigate(['champ/' + this.nameOfChampionship + '/participants'], { queryParams: { 'club': event } });
      window.scrollTo(0, 0);
    }
  }
}
