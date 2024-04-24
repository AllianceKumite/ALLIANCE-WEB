import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { HomeService } from 'src/app/shared/services/home.service';
import { CategoryService } from 'src/app/tournament/services/category.service';
import { TournamentService } from 'src/app/tournament/services/tournament.service';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DrawService } from '../../draw/draw-service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-exportxls',
  templateUrl: './exportxls.component.html',
  styleUrls: ['./exportxls.component.css'],
})
export class ExportxlsComponent {
  subscription: Subscription;
  champname: string = '';
  champcity: string = '';
  datefrom: string;
  dateto: string;
  dDatefrom: Date;
  dDateto: Date;
  tournament: any;
  nameOfChampionship: string = '';
  data;
  participants;
  winners;
  selectedCategory: any;
  categoryId: string;
  categoryNum: number;
  participant: string;
  categories: any[] = [];
  winnerscategory: any[] = [];
  

  constructor(
    private tournamentService: TournamentService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private homeService: HomeService,
    private translateService: TranslateService,
    private categoryService: CategoryService,
    private drawService: DrawService
  ) {}

  async ngOnInit() {
    this.subscription = this.homeService._champInfo.subscribe((champInfo) => {
      this.tournament = champInfo[1];

      this.datefrom = this.tournament?.champFrom;
      this.dateto = this.tournament?.champTo;
      this.dDatefrom = new Date(this.datefrom);
      this.dDateto = new Date(this.dateto);
      this.getChampInfo();
    });

    this.activeRoute.parent.params.subscribe((params) => {
      this.nameOfChampionship = params['name'];
    });

    await this.getCategories();
    for (let i = 0; i < this.categories.length; i++) {
      let num: string = this.categories[i].name;

      this.data = await this.getData(this.categories[i].id);
      this.participants = await this.drawService.getFightsParticipants(
        this.data.fights
      );

      this.winners = await this.getWinners(
        this.participants,
        this.data.category
      );
      this.winnerscategory.push(this.winners);
    }

    this.translateService.onLangChange.subscribe((event) => {
      this.getChampInfo();
      // this.onRowClick(this.categories[0]);
    });
  }

  getChampInfo() {
    let lng = localStorage.getItem('lng');
    if (lng === 'ru') {
      this.champname = this.tournament?.champNameRu;
      this.champcity = this.tournament?.champCityRu;
    }
    if (lng === 'ua') {
      this.champname = this.tournament?.champNameUa;
      this.champcity = this.tournament?.champCityUa;
    }
    if (lng === 'en') {
      this.champname = this.tournament?.champNameEn;
      this.champcity = this.tournament?.champCityEn;
    }
    // this.onRowClick(this.categoryNum);
  }

  async getCategories(): Promise<Array<any>> {
    let result: any;
    return new Promise((resolve, reject) => {
      this.homeService
        .getCategories({ title: this.nameOfChampionship })
        .subscribe((response: any[]) => {
          this.initCategories(response);
          resolve(result);
        });
    });
  }

  initCategories(response) {
    if (response) {
      let vals = Object.values(response);

      this.categories = Object.keys(response).map((w, index) => {
        return { id: w, name: vals[index] };
      });
    }
  }

  async getData(numcategory: string): Promise<Array<any>> {
    let result: any;

    return new Promise((resolve, reject) => {
      this.categoryService
        .getDrawData(this.nameOfChampionship, numcategory)
        .subscribe((data) => {
          result = data;
          resolve(result);
        });
    });
  }

  async getWinners(participantsByBlocks, category) {
    let totalParticipantsCount = await this.getTotalParticipantsCount(
      participantsByBlocks
    );
    // Category3Place is taken to account to decide should be shown 2 third places or 1 third place
    let isThirdPlaceFight = category.Category3Place == 1;

    let winnerIds =
      totalParticipantsCount == 2
        ? [category.idxAth1Place, category.idxAth2Place]
        : totalParticipantsCount == 3
        ? [category.idxAth1Place, category.idxAth2Place, category.idxAth3Place]
        : totalParticipantsCount > 3 && isThirdPlaceFight
        ? [category.idxAth1Place, category.idxAth2Place, category.idxAth3Place]
        : totalParticipantsCount > 3 && !isThirdPlaceFight
        ? [
            category.idxAth1Place,
            category.idxAth2Place,
            category.idxAth3Place,
            category.idxAth4Place,
          ]
        : [];

    return winnerIds.map((id, index) => {
      let winner = null;

      participantsByBlocks.every((participants) => {
        winner = participants.filter((p) => p && p.athId == id);

        if (winner && winner.length > 0) {
          winner = JSON.parse(JSON.stringify(winner[0]));
        } else {
          winner = {};
        }

        winner.place = index < 3 ? index + 1 : 3;

        return !winner.athId || winner.athId == -1;
      });

      return winner;
    });
  }

  async getTotalParticipantsCount(participantsByBlocks) {
    return participantsByBlocks.reduce(
      (reduced, participants) =>
        reduced +
        participants.filter((p) => p && p.athId && p.athId != -1).length,
      0
    );
  }

  export() { 
    let filename = `${this.nameOfChampionship}_result.xlsx`;
    let element = document.getElementById('exceltable');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Result');
    XLSX.writeFile(wb, filename);
  }
}
