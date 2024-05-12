import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HomeService } from '../../../../shared/services/home.service';
import { environment } from 'src/environments/environment';
import { OnlineService } from '../../../services/online.service';
import { TournamentService } from '../../../services/tournament.service';
import { Subscription } from 'rxjs';
import { OrderService } from 'src/app/tournament/services/order.service';

@Component({
  selector: 'app-online',
  templateUrl: './online.component.html',
  styleUrls: ['./online.component.css'],
})
export class OnlineComponent implements OnInit, OnDestroy {
  readonly logosDir: string = `${environment.logosDir}`;

  readonly defaultTatamisLength = 3;
  tatamis: any = [{}];

  @Input() tatami: number;
   
  startingTatamiId: number = 1;
  TATAMIS_AMOUNT: number = 3;
  // REFRESH_INTERVAL_ALL_TATAMIS: number = 10; //17.5;
  // REFRESH_INTERVAL_ONE_TATAMI: number = 10; //10;

  tatamiId: number;
  tatamiIdStart: number;
  tatamiIdEnd: number;

  nameOfChampionship: string;
  fightsFinished = '';

  champType: number;
  tatamiType: number;

  intervalId: any;
  intervalTatamiId: any;

  isMobileView: boolean = false;

  subsription: Subscription;
  clickEventsubscription: Subscription;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.isMobileView = event.target.screen.width < 768;
  }

  constructor(
    private activatedRouter: ActivatedRoute,
    private tournamentService: TournamentService,
    private onlineService: OnlineService,
    private homeService: HomeService,
    private orderService: OrderService,
  ) {
  }


  ngOnInit(): void {
    this.activatedRouter.parent.params.subscribe((params) => {
      const name = params['name'];
      this.nameOfChampionship = name;
      this.homeService._champInfo.subscribe(
        (champInfo) =>
          (this.tatamiType = champInfo[1] ? +champInfo[1]['typeTatami'] : null)
      );
      this.activatedRouter.queryParams.subscribe(async (param) => {
        let tatamiId = +param['tatami'];
        this.tatamiId = tatamiId;
        this.tatamiIdStart = Math.round(this.tatamiId / 100);
        this.tatamiIdEnd = this.tatamiId % 100;
        this.loadTatami();
      });
    });

  }

  loadTatami() {  
    this.onlineService.loadData(this.nameOfChampionship, this.tatamiId, this.tatamiIdStart, this.tatamiIdEnd, this.TATAMIS_AMOUNT);
    this.onlineService.tatami$.subscribe(
        tatamis => {
        this.tatamis = tatamis
      }
    )
    this.onlineService.loadTatami(this.nameOfChampionship, this.tatamiId, this.tatamiIdStart, this.tatamiIdEnd, this.TATAMIS_AMOUNT);
  }

  // private async fetchTatamis() {

  //   const response = await this.onlineService.getOnlineAllTatamisFights(
  //     this.nameOfChampionship,
  //     this.startingTatamiId,
  //     this.TATAMIS_AMOUNT
  //   );

  //   let tatamis = this.removeEmptyTatamis(response);

  //   if (tatamis && tatamis.length == 0) {
  //     tatamis = [{ tatamiId: -1 }];
  //   }

  //   this.setTatamisFights(tatamis);

  //   this.startingTatamiId =
  //     +(tatamis.length > 0 ? tatamis[tatamis.length - 1].tatamiId : 0) + 1;
  // }

  // private async fetchAnyTatamis() {

  //   const response = await this.onlineService.getOnlineAllTatamisFights(
  //     this.nameOfChampionship,
  //     this.startingTatamiId,
  //     35
  //   );

  //   let tatamis = this.removeEmptyTatamis(response);

  //   if (tatamis && tatamis.length == 0) {
  //     tatamis = [{ tatamiId: -1 }];
  //   }

  //   this.setTatamisFights(tatamis);

  // }

  // private async fetchTatami(tatamiId) {
  //   this.onlineService
  //     .getOneTatami(this.nameOfChampionship, tatamiId)
  //     .subscribe((response) => {
  //       this.setTatamisFights([{ fights: response, tatamiId: tatamiId }]);
  //     });
  // }

  private normalizeFIO(participant: any) {
    const rSpl = participant.red.FIO.split(' ');
    const rName = rSpl[0];
    const rLastName = rSpl[1];
    participant.red.FIO = rName + ' ' + rLastName;

    const wSpl = participant.white.FIO.split(' ');
    const wName = wSpl[0];
    const wLastName = wSpl[1];
    participant.white.FIO = wName + ' ' + wLastName;
  }

  // private removeEmptyTatamis(tatamiFights: any) {
  //   if (tatamiFights) {
  //     if (this.tatamiIdStart > 0) {
  //       tatamiFights = tatamiFights.filter(
  //         (tatami) =>
  //           tatami.fights &&
  //           tatami.fights.length &&
  //           tatami.fights.length > 0 &&
  //           (tatami.tatamiId >= this.tatamiIdStart &&
  //             tatami.tatamiId <= this.tatamiIdEnd)
  //       );
  //     } else {
  //       tatamiFights = tatamiFights.filter(
  //         (tatami) =>
  //           tatami.fights && tatami.fights.length && tatami.fights.length > 0
  //       );
  //     }
  //   }

  //   return tatamiFights;
  // }

  // private removeBadTatamis(tatamiFights: any) {

  //   if (tatamiFights) {
  //     if (this.tatamiIdStart > 0) {
  //       tatamiFights = tatamiFights.filter(
  //         (tatami) =>
  //           tatami.fights &&
  //           tatami.fights.length &&
  //           tatami.fights.length > 0 &&
  //           (tatami.tatamiId >= this.tatamiIdStart ||
  //             tatami.tatamiId <= this.tatamiIdEnd)
  //       );
  //     } else {
  //       tatamiFights = tatamiFights.filter(
  //         (tatami) =>
  //           tatami.fights && tatami.fights.length && tatami.fights.length > 0
  //       );
  //     }
  //   }

  //   return tatamiFights;
  // }

  // private setTatamisFights(tatamiFights: any) {
  //   this.tatamis = tatamiFights;
  // }

  ngOnDestroy(): void {
    if(this.subsription){this.subsription.unsubscribe()};
    if(this.clickEventsubscription){this.clickEventsubscription.unsubscribe()};
    this.onlineService.clearAllTimer();
  }
}
