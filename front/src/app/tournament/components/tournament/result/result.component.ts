import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { TournamentService } from '../../../services/tournament.service'
import { HomeService } from 'src/app/shared/services/home.service';


@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {

  // TODO: outdated
  resultSrc: string = `${environment.mediaDir}/results`;

  offset: string;

  safeUrl: any;

  nameOfChampionship: string;

  resultSvg: any = {
  }

  ENTITIES = {
    "1" : "club",
    "2" : "coach",
    "3" : "country",
    "4" : "organization",
    "5" : "region",
    "6" : "club-quota",
    "7" : "region-quota",
    "8" : "coach-quota",
    "9" : "club-count",
    "10": "club-women"
  }

  indyvidualResults: any;
  groupedResults: any;
  entityName: string;

  tatami: number;
  time: number;
  tatamiType : number;

  // clubResults: any;
  // coachResults: any;

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

          this.resultSrc += '/' + this.nameOfChampionship;

          this.activeRoute.queryParams.subscribe(param => {
              this.clearResults();

              if (this.drawFromSvg()) {
                  this.getResultSvg(param["offset"])
              } else {
                  this.getResultFromData(param, name)
                  // console.log(data);
                  
              }
        });
      });
  }

    clearResults()  {
        this.indyvidualResults = null;
        this.groupedResults = null;
        this.entityName = null;
    }

    getResultSvg(offset) {
        this.resultSvg[offset] = this.resultSvg[offset].replace(' ', '%20');
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.resultSrc + '/' + this.resultSvg[offset]);
    }

    getResultFromData(config, name) {
        let offset = config["offset"];
        this.tatami = Number(config["tatami"]);
        this.time = Number(config["time"]);

        if (offset == "0") {
            return this.tournamentService
                .getIndividualResults({"title": name, "tatami": this.tatami, "time": this.time})
                .subscribe(response => this.indyvidualResults = response
                  )
        } else {
            this.entityName = this.ENTITIES[offset]

            return this.tournamentService
                .getGroupedResults({"title": name, "entity": this.entityName})
                .subscribe(response => this.groupedResults = response)
        }
        
    }

    drawFromSvg() {
      return false;
    }

}
