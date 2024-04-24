import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HomeService } from '../../../shared/services/home.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'tatami-title',
  templateUrl: './tatami-title.component.html',
  styleUrls: ['./tatami-title.component.css'],
})
export class TatamiTitleComponent implements OnInit, OnDestroy {
  @Input() id;
  @Input() up: boolean;
  @Input() tatamiType: number;

  private subscription: Subscription;

  static readonly TATAMI_NAMES_HASH = {
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D',
    5: 'E',
    6: 'F',
    7: 'G',
    8: 'H',
    9: 'J',
    10: 'K',
    11: 'L',
    12: 'M',
  };

  tatamiNamesHash = TatamiTitleComponent.TATAMI_NAMES_HASH;

  constructor(
    private activeRoute: ActivatedRoute,
    private homeService: HomeService
  ) {}

  ngOnInit(): void {
    // this.subscription = this.homeService._champInfo.subscribe(
    //   (champInfo) =>
    //     (this.tatamiType = champInfo[1] ? +champInfo[1]['typeTatami'] : null)
    // );

    this.activeRoute.paramMap.subscribe((params) => {
      let name = params['params']['name'];

      this.homeService.getChampInfo(name);
    });
  }

  ngOnDestroy(): void {
    // this.subscription?.unsubscribe();
  }

  getName() {
    let name = '';
    let idfrom: number;
    let idto: number;

    // console.log(this.tatamiType);
    

    if (this?.id < 12) {
      name = this.tatamiType == 1 ? this.tatamiNamesHash[this.id] : this.id;
    } else {
        idfrom = Math.round(this.id / 100);
        idto = this.id - idfrom * 100;
        // idto = this.id % 100;


      if (this.tatamiType == 1) {
        name = this.tatamiNamesHash[idfrom] + '-' + this.tatamiNamesHash[idto];
      } else {
        name = `${idfrom}-${idto}`;
      }
    }
    return name;
  }

  public static getTitle(prefix, tatamiType, id) {
    let tatamiName =
      id >= 0
        ? tatamiType === 1
          ? TatamiTitleComponent.TATAMI_NAMES_HASH[id]
          : id
        : '';
    let tatamiTitle = prefix + ' ' + tatamiName;

    return tatamiTitle;
  }
}
