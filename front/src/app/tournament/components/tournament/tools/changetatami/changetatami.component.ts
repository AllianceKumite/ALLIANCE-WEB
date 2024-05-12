import { Component, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Tatami } from 'src/app/tournament/models/tatami.model';
import { TournamentService } from 'src/app/tournament/services/tournament.service';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { ConfirmService } from 'src/app/tournament/services/confirm.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-changetatami',
  templateUrl: './changetatami.component.html',
  styleUrls: ['./changetatami.component.css'],
})
export class ChangetatamiComponent {
  filter: any = {
    title: '',
    level: 6
  };

  tatamies: Tatami[];
  tatamiesIds: any[] = [];

  // type: number;

  isActive: any[] = [];

  isMobileView: boolean = false;
  champName;
  levelselect = 0;

  // listName = [
  //   'list1',
  //   'list2',
  //   'list3',
  //   'list4',
  //   'list5',
  //   'list6',
  //   'list7',
  //   'list8',
  //   'list9',
  //   'list10',
  //   'list11',
  //   'list12'
  // ];

  listName = [
    ['list2', 'list3', 'list4', 'list5', 'list6', 'list7', 'list8', 'list9', 'list10', 'list11', 'list12'],
    ['list1', 'list3', 'list4', 'list5', 'list6', 'list7', 'list8', 'list9', 'list10', 'list11', 'list12'],
    ['list1', 'list2', 'list4', 'list5', 'list6', 'list7', 'list8', 'list9', 'list10', 'list11', 'list12'],
    ['list1', 'list2', 'list3', 'list5', 'list6', 'list7', 'list8', 'list9', 'list10', 'list11', 'list12'],
    ['list1', 'list2', 'list3', 'list4', 'list6', 'list7', 'list8', 'list9', 'list10', 'list11', 'list12'],
    ['list1', 'list2', 'list3', 'list4', 'list5', 'list7', 'list8', 'list9', 'list10', 'list11', 'list12'],
    ['list1', 'list2', 'list3', 'list4', 'list5', 'list6', 'list8', 'list9', 'list10', 'list11', 'list12'],
    ['list1', 'list2', 'list3', 'list4', 'list5', 'list6', 'list7', 'list9', 'list10', 'list11', 'list12'],
    ['list1', 'list2', 'list3', 'list4', 'list5', 'list6', 'list7', 'list8', 'list10', 'list11', 'list12'],
    ['list1', 'list2', 'list3', 'list4', 'list5', 'list6', 'list7', 'list8', 'list9', 'list11', 'list12'],
    ['list1', 'list2', 'list3', 'list4', 'list5', 'list6', 'list7', 'list8', 'list9', 'list10', 'list12'],
    ['list1', 'list2', 'list3', 'list4', 'list5', 'list6', 'list7', 'list8', 'list9', 'list10', 'list11']
  ];

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.isMobileView = event.target.screen.width < 990;
  }

  constructor(
    private tournamentService: TournamentService,
    private activatedRouter: ActivatedRoute,
    private сonfirmService: ConfirmService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.isMobileView = window.screen.width < 990;
    this.getData()
  }

  getData() {
    this.activatedRouter.parent.params.subscribe((params) => {
      const result = params['name'];
      this.champName = result;

      this.filter = {
        title: result,
      };
    });
    this.filter.level = 6;
    this.requestTatamisInfo();
  }

  requestTatamisInfo() {
    this.tournamentService.getTatami(this.filter).subscribe((response) => {
      this.tatamies = Object.values(response).map((tatami) => {
        this.tatamiesIds.push(tatami.categoriesIds);
        return tatami;
      });
    });
  }

  async setTatamiCategory() {
    let wait = document.getElementById('preloader');
    wait.style.display = 'block';
    // await this.saveChange();
    await this.saveChangeRenumber();
  }

  async saveChange() {
    let wait = document.getElementById('preloader');
    this.tournamentService.setTatami({
      title: this.filter?.title,
      data: this.tatamies,
      renumber: false
    })
      .subscribe((response) => {
        wait.style.display = 'none';
        this.getData();
      });
    // this.getData()
  }

  async saveChangeRenumber() {
    let wait = document.getElementById('preloader');
    this.tournamentService.setTatami({
      title: this.filter?.title,
      data: this.tatamies,
      renumber: true
    })
      .subscribe((response) => {
        wait.style.display = 'none';
      });
  }

  ngOnDestroy(): void { }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    let down = event.container.data;
    this.saveChange()
  }

  changeLevelSelect(value) {
    switch (value) {
      case 0:
        this.filter.level = 6;
        break;
      case 1:
        this.filter.level = 7;
        break;
      case 2:
        this.filter.level = 12;
        break;
    }
  }

  onSelectDataByLevel() {
    let message = this.translateService.instant('tools.changetatami.selectdata') + ' ' + this.translateService.instant('tools.changetatami.atlevel') + ' ';
    let msglevel = '';    
    switch (Number(this.filter.level)) {
      case 6:
        msglevel = this.translateService.instant('tools.changetatami.level14')
        break;
      case 7:
        msglevel = this.translateService.instant('tools.changetatami.semifinal')
        break;
      case 12:
        msglevel = this.translateService.instant('tools.changetatami.final')
        break;
    }
    message = message + '[' + msglevel + '] ?'
    this.сonfirmService.confirm(
      message,
      () => { /* this.winnnerConfirmed() */
        this.selectDataByLevel()
      },
      () => { /* this.winnnerDeclined()*/
      }
    );
  }

  selectDataByLevel() {
    this.tournamentService.selectDataByLevel(
      this.filter
    )
      .subscribe((response) => {

      });

  }

  onCreateCopyTournament() {
    let message = this.translateService.instant('tools.changetatami.createcopy');
    let fullmessage = `${message} [${this.champName}] ?`
    this.сonfirmService.confirm(
      fullmessage,
      () => { /* this.Confirmed() */
        this.createcopychamp()
      },
      () => { /* this.Declined()*/
      }
    );
  }

  createcopychamp() {
      this.tournamentService.createCopyChamp(
        this.filter
      )
      .subscribe((response) => {

    });
  }

}



