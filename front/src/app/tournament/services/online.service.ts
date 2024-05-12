import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { environment } from 'src/environments/environment';
// import { Participant } from '../models/participant.model';

@Injectable({
  providedIn: 'root'
})

export class OnlineService {
  private _tatamiSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  public tatami$: Observable<any> = this._tatamiSubject.asObservable();

  constructor(
    private http: HttpClient,
  ) {
  }

  REFRESH_INTERVAL_ALL_TATAMIS: number = 15; //17.5;
  // REFRESH_INTERVAL_ONE_TATAMI: number = 15; //10;

  intervalId: any;
  intervalIdOne: any;

  startingTatamiId;
  nameOfChampionship;
  tatamisAmount;
  tatamis;
  tatamiIdStart;
  tatamiIdEnd;

  isUpdate: boolean = false;

  tatamiNumFight = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];

  nextFightSelectedCoach;
  nextFightSelectedClub;

  clearAllTimer(){
    clearInterval(this.intervalIdOne);
    clearInterval(this.intervalId);
  }

  loadTatami(nameOfChampionship, numberTatami, startTatami = 0, endTatamiId = 0, tatamiAmount = 0) {
    // loadTatami(nameOfChampionship, numberTatami, startTatami = 0, endTatamiId = 0, tatamiAmount = 0) {
    this.startingTatamiId = startTatami;
    this.nameOfChampionship = nameOfChampionship;
    this.tatamisAmount = tatamiAmount;
    this.tatamiIdStart = startTatami;
    this.tatamiIdEnd = endTatamiId;


    let tatamiId = Number(numberTatami);
    let currFight;

    if (tatamiId == 0) {
    } else {
      if (tatamiId > 11) {

        this.startingTatamiId = this.tatamiIdStart;
        this.tatamisAmount = 3;

        clearInterval(this.intervalIdOne);
        this.intervalId = setInterval(() => {
          this.getNumFigth(tatamiId).subscribe(response => {
            currFight = response;

            this.isUpdate = currFight[this.startingTatamiId - 1] != this.tatamiNumFight[this.startingTatamiId - 1] ||
              currFight[this.startingTatamiId] != this.tatamiNumFight[this.startingTatamiId] ||
              currFight[this.startingTatamiId + 1] != this.tatamiNumFight[this.startingTatamiId + 1];

            if (this.isUpdate) {
              this.tatamiNumFight[this.startingTatamiId - 1] = currFight[this.startingTatamiId - 1];
              this.tatamiNumFight[this.startingTatamiId] = currFight[this.startingTatamiId];
              this.tatamiNumFight[this.startingTatamiId + 1] = currFight[this.startingTatamiId + 1];
              this.loadData(nameOfChampionship, tatamiId, this.tatamiIdStart, this.tatamiIdEnd, this.tatamisAmount);
            }

            // console.log(this.tatamiNumFight);
            
          }
          );

        }, this.REFRESH_INTERVAL_ALL_TATAMIS * 1000);

      } else {
        this.startingTatamiId = 0;
        this.tatamisAmount = 0;
        clearInterval(this.intervalId);
        this.intervalIdOne = setInterval(() => {
          this.getNumFigth(tatamiId).subscribe(response => {
            currFight = response;
            for (let i in currFight) {
              if (Number(i) + 1 == tatamiId) {
                this.isUpdate = currFight[i] != this.tatamiNumFight[i];
                this.tatamiNumFight[i] = currFight[i];
                break;
              }
            }

            if (this.isUpdate) {
              this.loadDataOneTatami(nameOfChampionship, tatamiId)
            }
            // console.log(this.tatamiNumFight);
          }
          );

        }, this.REFRESH_INTERVAL_ALL_TATAMIS * 1000);
      }
    }
  }

  loadData(nameOfChampionship, numberTatami, startTatami = 0, endTatamiId = 0, tatamiAmount = 0) {
    this.startingTatamiId = startTatami;
    this.nameOfChampionship = nameOfChampionship;
    this.tatamisAmount = tatamiAmount;
    this.tatamiIdStart = startTatami;
    this.tatamiIdEnd = endTatamiId;
    let tatamiId = numberTatami;

    if (tatamiId == 0) {

    }
    else {
      if (tatamiId > 11) {
        this.startingTatamiId = this.tatamiIdStart;
        this.tatamisAmount = 3;
      }
      else {
        this.startingTatamiId = 0;
        this.tatamisAmount = 0;
      }
    }


    this.getNumFigth(tatamiId).subscribe(response => {
      let currFight = response;
      for (let i in currFight) {
        this.tatamiNumFight[Number(i)] = currFight[i];
      }
    }   
    );

    if (tatamiId === 0) {
      this.fetchTatamis();
    } else {
      if (tatamiId > 11) {
        this.startingTatamiId = startTatami;
        this.fetchAnyTatamis();
      } else {
        this.fetchTatami(tatamiId);
      }
    }
  }

  loadDataOneTatami(nameOfChampionship, numberTatami) {
    this.nameOfChampionship = nameOfChampionship;
    let tatamiId = numberTatami;
    this.fetchTatami(tatamiId);
  }

  private async fetchTatamis() {

    const response = await this.getOnlineAllTatamisFights(
      this.nameOfChampionship,
      this.startingTatamiId,
      this.tatamisAmount
    );

    let tatamis = this.removeEmptyTatamis(response);

    if (tatamis && tatamis.length == 0) {
      tatamis = [{ tatamiId: -1 }];
    }


    this.setTatamisFights(tatamis);

    this.startingTatamiId =
      +(tatamis.length > 0 ? tatamis[tatamis.length - 1].tatamiId : 0) + 1;
  }

  private async fetchAnyTatamis() {

    // this.startingTatamiId = 1;
    const response = await this.getOnlineAllTatamisFights(
      this.nameOfChampionship,
      this.startingTatamiId,
      35
    );

    let tatamis = this.removeEmptyTatamis(response);

    if (tatamis && tatamis.length == 0) {
      tatamis = [{ tatamiId: -1 }];
    }

    this.setTatamisFights(tatamis);
  }

  private async fetchTatami(tatamiId) {
    this.getOneTatami(this.nameOfChampionship, tatamiId)
      .subscribe((response) => {
        this.setTatamisFights([{ fights: response, tatamiId: tatamiId }]);
      });
  }


  private removeEmptyTatamis(tatamiFights: any) {
    if (tatamiFights) {
      if (this.tatamiIdStart > 0) {
        tatamiFights = tatamiFights.filter(
          (tatami) =>
            tatami.fights &&
            tatami.fights.length &&
            tatami.fights.length > 0 &&
            (tatami.tatamiId >= this.tatamiIdStart &&
              tatami.tatamiId <= this.tatamiIdEnd)
        );
      } else {
        tatamiFights = tatamiFights.filter(
          (tatami) =>
            tatami.fights && tatami.fights.length && tatami.fights.length > 0
        );
      }
    }
    return tatamiFights;
  }

  private setTatamisFights(tatamiFights: any) {
    // this.tatamis = tatamiFights;
    this._tatamiSubject.next(tatamiFights);
  }

  getOneTatami(name: string, tatamiId: number) {
    return this.http.post(`${environment.serverApiUrl}/api-champ-get-online-tatami-fights`, { 'title': name, 'tatami': tatamiId });
  }

  getOnlineAllTatamisFights(name: string, startingTatamiId: number, tatamisAmount: number) {
    return this.http.post(`${environment.serverApiUrl}/api-champ-get-online-all-tatamis-fights`, { 'title': name, 'startingTatamiId': startingTatamiId, 'tatamisAmount': tatamisAmount }).toPromise();
  }

  getNumFigth(tatamiId: number) {
    return this.http.post(`${environment.serverApiUrl}/api-champ-get-online-tatami-fight-number`, { 'tatami': tatamiId });
  }

  getNumFigthsTatamis(tatamiId: number) {
    return this.http.post(`${environment.serverApiUrl}/api-champ-get-online-tatami-fight-number`, { 'tatami': tatamiId });
  }

}
