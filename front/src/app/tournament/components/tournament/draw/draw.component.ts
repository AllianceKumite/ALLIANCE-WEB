import { ChangeDetectorRef, Component, Input, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { CategoryService } from '../../../services/category.service';
import { TournamentService } from '../../../services/tournament.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DrawService } from './draw-service';

@Component({
  selector: 'app-draw',
  templateUrl: './draw.component.html',
  styleUrls: ['./draw.component.css'],
})
export class DrawComponent implements OnInit, OnChanges {
  @Input() categoryId: string;

  nameOfChampionship: string = '';

  category: string;

  drawCategory: any;

  champType: number;

  // TODO: outdated. Not used anymore.
  drawDir: string = `${environment.mediaDir}/draw_photo`;

  safeUrl: any;

  data;

  participants;
  winners;
  showExtendedInfo: boolean = false;

  typeOlimp = environment.typeOlimp;
  typeCircle = environment.typeCircle;
  typeKata = environment.typeKata;
  typeWKB = environment.typeWKB;

  constructor(
    private drawService: DrawService,
    private activeRoute: ActivatedRoute,
    private tournamentService: TournamentService,
    private categoryService: CategoryService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,

  ) { }

  ngOnChanges(): void {
    this.category = this.categoryId;
    this.printDraw();
    this.cdr.detectChanges();
    this.drawService.isDrawCat = true;
  }

  ngOnInit(): void {
    this.activeRoute.parent.params.subscribe((params) => {
      const name = params['name'];

      this.nameOfChampionship = name;
      this.drawDir += '/' + this.nameOfChampionship;
    });

    this.tournamentService
      .getChampType(this.nameOfChampionship)
      .subscribe((response) => {
        this.champType = response['type'];
        this.showExtendedInfo = this.champType == 1;

      });

    this.activeRoute.queryParams.subscribe((param) => {
      this.category = param['category'];
      // this.printDraw(param);
      this.printDraw();
    });
  }

  cleanData() {
    this.drawCategory = null;
    this.safeUrl = null;
    this.data = null;
  }

  // printDraw(param) {
  printDraw() {
    // this.category = param['category'];
    // if (!this.category) {
    //   this.category = this.categoryId;
    // }

    this.data = null;
    this.categoryService
      .getDrawData(this.nameOfChampionship, this.category)
      // .pipe(map( this.parseData ))
      .subscribe((data) => {
        if (this.isDrawnFromData(data)) {
          this.data = data;
          this.data.blocks = this.splitByBlocksAndLevels(
            this.data.fights,
            this.data.category
          );
          this.participants = this.drawService.getFightsParticipants(
            this.data.fights
          );

          this.winners = this.getWinners(this.participants, this.data.category);

          if (!this.noData(data)) {
            this.data.category.tatamiId =
              this.data?.fights?.length > 0 &&
              this.data?.fights[0]?.details?.TatamiId;
          }
          // this.drawService.isDrawCat = true;
        }
      });
  }

  splitByBlocksAndLevels(fights, category) {
    let blocks = null;

    if (fights && fights.length > 0) {
      blocks = fights?.reduce((restructuredFights, fight, index) => {
        let levePair = fight.details['LevePair'];
        let blockNum = fight.details['BlockNum'];

        // let numPair = fight.details['NumPair'];

        if (!restructuredFights[blockNum]) {
          restructuredFights[blockNum] = [];
          restructuredFights.amount =
            typeof restructuredFights.amount == 'undefined'
              ? 1
              : restructuredFights.amount + 1;
        }

        if (!restructuredFights[blockNum][levePair]) {
          restructuredFights[blockNum][levePair] = [];
        }

        if (
          // If fight is final or fight for 3-d place then change the order of it in array
          // (for printing order convenience)
          ((this.isOlympicCategory(category) || this.isWkbCategory(category)) &&
            (fight.details.Duel1Place == '1' ||
              fight.details.Duel3Place == '1' ||
              fight.details.Duel5Place == '1')) ||
          (this.isCircleCategory(category) &&
            (fight.details.Level == 12 || fight.details.Level == 8))
        ) {
          // 8 7 6 5
          restructuredFights[blockNum][levePair].unshift(fight);
          // restructuredFights[levePair].push(fight);
        } else {
          // 1 2 3 4
          // console.log(levePair, restructuredFights[blockNum][levePair].length, category);
          restructuredFights[blockNum][levePair].push(fight);

          // Это категории ката кан и WKB
          // LevelCircle = 8 - WKB
          // LevelCircle 5,4 - KAN
          // if (this.isWkbCategory(category)) {
          //   if (levePair == 1) {
          //     if (restructuredFights[blockNum][levePair].length < category.LevelCircle) {
          //       restructuredFights[blockNum][levePair].push(fight);
          //     }
          //   }
          //   else { restructuredFights[blockNum][levePair].push(fight); }
          // }
          // else { restructuredFights[blockNum][levePair].push(fight); }
        }

        return restructuredFights;

      }, []);
    }

    return blocks;
  }

  // TODO management.ts
  // do not copy paste
  isOlympicCategory(category) {
    let result = category.CategoryType == this.typeOlimp || category.CategoryType == this.typeKata;
    result = category && result;
    return result;
    // return category && +category.CategoryType == this.typeOlimp;
    // return category && +(category.CategoryType == this.typeOlimp || category.CategoryType == this.typeKata);
  }

  isCircleCategory(category) {
    return category && +category.CategoryType == this.typeCircle;
  }

  isWkbCategory(category) {
    return category && +category.CategoryType == this.typeWKB;
  }

  isOlympic(data): boolean {
    // let result = data.category.CategoryType == this.typeOlimp || data.category.CategoryType == this.typeKata;
    let result = data && data.category && (data.category.CategoryType == this.typeOlimp || data.category.CategoryType == this.typeKata);
    return result;

    // return data && data.category && + (data.category.CategoryType == this.typeOlimp || data.category.CategoryType == this.typeKata);
  }

  isCircle(data) {
    return data && data.category && +data.category.CategoryType == this.typeCircle;
  }

  isWkb(data) {
    return data && data.category && +data.category.CategoryType == this.typeWKB;
  }

  isData(data) {
    return !this.noData(data);
  }

  noData(data) {
    return data && data.fights && data.fights.length == 0;
  }

  isDrawnFromData(data) {
    return (
      this.isOlympic(data) ||
      this.isCircle(data) ||
      this.isWkb(data) ||
      this.noData(data)
    );
  }

  printSvg(param) {
    this.category = param['category'];

    this.categoryService
      .getDrawSvg(
        this.nameOfChampionship,
        localStorage.getItem('lng') || 'ua',
        this.category
      )
      .subscribe((response) => {
        this.drawCategory = response['url'][0];

        if (this.drawCategory) {
          this.drawCategory = this.drawCategory?.replace(' ', '%20');
          this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.drawDir + '/' + this.drawCategory
          );
        }
      });
  }

  getTotalParticipantsCount(participantsByBlocks) {
    return participantsByBlocks.reduce(
      (reduced, participants) =>
        reduced +
        participants.filter((p) => p && p.athId && p.athId != -1).length,
      0
    );
  }

  getWinners(participantsByBlocks, category) {
    let totalParticipantsCount =
      this.getTotalParticipantsCount(participantsByBlocks);
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
}
