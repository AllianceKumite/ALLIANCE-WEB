import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Tatami, TatamiUrl } from '../../../models/tatami.model';
import { TournamentService } from '../../../services/tournament.service';
import { HomeService } from 'src/app/shared/services/home.service';

@Component({
  selector: 'app-tatami',
  templateUrl: './tatami.component.html',
  styleUrls: ['./tatami.component.css']
})
export class TatamiComponent implements OnInit, OnDestroy {
  filter: any = {
    title: null
  }

  SETTINGS = {
    COLLAPSED_CATEGORIES_NUMBER: 4,
    CURRENT_FIGHT_SIZE: 4
  }

  REFRESH_TIMEOUT = 15
  // REFRESH_TIMEOUT = 3.5

  tatamies: Tatami[];
  tatamiesVideo : TatamiUrl[];
  tatamiesIds: any[] = [];
  tatamiType : number;
  videofile;

  // type: number;

  isActive: any[] = [];

  isMobileView: boolean = false;
  champName;

  timeoutId;

  @HostListener('window:resize', ['$event'])
	onResize(event) {
		this.isMobileView = event.target.screen.width < 990;
	}

  constructor(
    private tournamentService: TournamentService,
    private activatedRouter: ActivatedRoute,
    private homeService: HomeService,

  ) { }

  ngOnInit(): void {
    this.isMobileView = window.screen.width < 990;

    this.homeService._champInfo.subscribe((champInfo) => {
      let tournament = champInfo[1];
      this.tatamiType = tournament ? +tournament['typeTatami'] : null;
    });


    this.activatedRouter.parent.params.subscribe(params => {
      const result = params["name"];
      this.champName = result;

      this.filter = {
        title: result
      };
    });

    this.tournamentService.getTatamiUrlVideo(this.filter).subscribe(response => {
      this.tatamiesVideo = Object.values(response);
    })

    this.requestTatamisInfo(() => this.requestTatamisCurrentFightsByTimeout());
    // this.requestTatamisInfo(this.requestTatamisInfoByTimeout)
    // this.tournamentService.getChampType(this.filter.title).subscribe(response => {
    //   this.type = response["type"];
    // });
  }

  onClickUrl(index){
    this.videofile =this.tatamiesVideo[index].url;
  }
  // unused done
  // TODO: Optimize to retrieve only changed data
  requestTatamisInfoByTimeout () {
    this.timeoutId = setTimeout(() => {
      this.requestTatamisInfo(this.requestTatamisInfoByTimeout);
    }, this.REFRESH_TIMEOUT * 1000)
  }

  requestTatamisCurrentFightsByTimeout() {
    this.timeoutId = setTimeout(() => {
      this.requestTatamisCurrentFights(() => this.requestTatamisCurrentFightsByTimeout());
    }, this.REFRESH_TIMEOUT * 1000)

    // clearInterval(this.timeoutId);
  }

  requestTatamisCurrentFights(callback) {
    this.tournamentService.getTatamisCurrentFight(this.filter).subscribe(response => {
      this.updateTatamisCurrentFights(response);

      if (typeof callback == "function") {
        callback();
      }
    });
  }

  requestTatamisInfo(callback) {
      this.tournamentService.getTatami(this.filter).subscribe(response => {
        this.tatamies = Object.values(response).map(tatami => {
          this.tatamiesIds.push(tatami.categoriesIds);
  
          tatami.categoriesIds = tatami.categoriesIds.filter(
              (x, i) => this.shouldCategoryBeShown(tatami, i)
          );
  
          // for(let itemurl of this.tatamiesVideo){
          //     if (tatami.tatamiId = itemurl.tatamiId){
          //       tatami.urlVideo = itemurl.urlVideo;
          //       break;
          //     }
          // }
          return tatami;
        });
  
  
          if (typeof callback == "function") {
          callback();
        }
      });
    // })
  }


  updateTatamisCurrentFights(newFights) {
    let hasChanged = false;

    for (let i = 0; i < this.tatamies.length; i++) {
        let updatedFight = newFights[i + 1];
          if (updatedFight) {
              if (!this.tatamies[i].fight || (this.tatamies[i].fight && (this.tatamies[i].fight.details.ownId != updatedFight.details.ownId))) {
                  this.tatamies[i].fight = updatedFight;
                  hasChanged = true
              } else {
                  // Doing nothing with tatami ', i + 1)
              }
          } else {
              if (this.tatamies[i].fight) {
                  // Deleting current fight for tatami ', i + 1

                  this.tatamies[i].fight = null;
                  hasChanged = true
              }
          }
    }
  }

  showMore(index) {
    this.isActive[index] = true;
    this.tatamies = this.tatamies.map((tatami, idx) => {
      if (index === idx) {
        tatami.categoriesIds = this.tatamiesIds[index];
      }
      return tatami;
    });
  }

  showLess(index) {
    this.isActive[index] = false;
    this.tatamies = this.tatamies.map((tatami, idx) => {
      if (index === idx) {
        tatami.categoriesIds = tatami.categoriesIds.filter(
          (x, i) => this.shouldCategoryBeShown(tatami, i)
        );
      }
      return tatami;
    });
  }

  shouldCategoryBeShown (tatami, categoryIndex) {
    let isCuttentFightExpanded = typeof tatami.fight !== 'undefined';

    let sizeWithCurrentFightExpanded = this.SETTINGS.COLLAPSED_CATEGORIES_NUMBER;
    let sizeWithCurrentFightCollapsed = sizeWithCurrentFightExpanded + this.SETTINGS.CURRENT_FIGHT_SIZE

    return isCuttentFightExpanded && (categoryIndex < sizeWithCurrentFightExpanded) ||
          !isCuttentFightExpanded && (categoryIndex < sizeWithCurrentFightCollapsed)
  }

  ngOnDestroy(): void {
    clearInterval(this.timeoutId)
  }
}
