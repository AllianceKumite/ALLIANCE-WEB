import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TournamentService } from '../../services/tournament.service';
import { HomeService } from 'src/app/shared/services/home.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-winner-clubs',
  templateUrl: './winner-clubs.component.html',
  styleUrls: ['./winner-clubs.component.css']
})
export class WinnerClubsComponent {

  nameOfChampionship: string;
  tatami: number;
  time: number;
  tatamiType: number;
  resultSrc: string = `${environment.mediaDir}/results`;
  indyvidualResults: any;
  clubs: any[] = [];
  clubWinners1: any[] = [];
  clubWinners2: any[] = [];
  clubWinners3: any[] = [];
  selectedClub = 'No selected club';
  readonly logosDir: string = `${environment.logosDir}`;

  constructor(private activeRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private tournamentService: TournamentService,
    private homeService: HomeService,

  ) { }

  ngOnInit(): void {
    this.homeService._champInfo.subscribe((champInfo) => {
      let tournament = champInfo[1];
      this.tatamiType = tournament ? +tournament['typeTatami'] : null;
    });


    this.activeRoute.parent.params.subscribe(params => {
      const name = params["name"];
      this.nameOfChampionship = name;

      this.tournamentService.getClubs({ title: name }).subscribe((response) => {
        this.clubs = Object.values(response);
        this.clubs = this.clubs.sort(function (entity1, entity2) {
          let result = 0;
          if (entity1.name.toUpperCase() < entity2.name.toUpperCase()) {
            result = -1
          }
          if (entity1.name.toUpperCase() > entity2.name.toUpperCase()) {
            result = 1
          }
          return result
        })
      });

      this.resultSrc += '/' + this.nameOfChampionship;

      this.activeRoute.queryParams.subscribe(param => {
        this.clearResults();

        this.getResultFromData(param, name);
      });
    });
  }

  clearResults() {
    this.indyvidualResults = null;
  }

  onRowClick(clubname) {
    // console.log(clubname);
    this.selectedClub = clubname;

    this.clubWinners1 = this.indyvidualResults.filter((item) => item.clubName == clubname && item.place == 1);
    this.clubWinners2 = this.indyvidualResults.filter((item) => item.clubName == clubname && item.place == 2);
    this.clubWinners3 = this.indyvidualResults.filter((item) => item.clubName == clubname && item.place == 3);
  }

  getLogo(place) {
    let result = '';
    switch (place) {
      case 1:
        result = 'cup-1.svg';
        break;
      case 2:
        result = 'cup-2.svg';
        break;
      case 3:
        result = 'cup-3.svg';
        break;
    }
    result = this.logosDir +'/' + result
    return result
  }

  getResultFromData(config, name) {
    this.tatami = Number(config["tatami"]);
    this.time = Number(config["time"]);

    return this.tournamentService
      .getIndividualResultsByClub(
        { "title": name, "tatami": this.tatami, "time": this.time }
      )
      .subscribe(response => {
        this.indyvidualResults = response
        this.indyvidualResults = this.indyvidualResults.sort(function (entity1, entity2) {
          let result = 0;
          if (entity1.clubName < entity2.clubName) {
            result = -1
          }
          if (entity1.clubName > entity2.clubName) {
            result = 1
          }

          if (result == 0) {
            result = entity1.place - entity2.place;
          }
          return result
        })
        // console.log(this.indyvidualResults);
      })
    // .subscribe(response => console.log(response))
  }

}
