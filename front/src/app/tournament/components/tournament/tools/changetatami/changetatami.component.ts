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

@Component({
  selector: 'app-changetatami',
  templateUrl: './changetatami.component.html',
  styleUrls: ['./changetatami.component.css'],
})
export class ChangetatamiComponent {
  filter: any = {
    title: null,
    level: null
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
    private activatedRouter: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log(this.listName[0]);
    console.log(this.listName[1]);
    
    this.isMobileView = window.screen.width < 990;
    this.getData()
    // this.activatedRouter.parent.params.subscribe((params) => {
    //   const result = params['name'];
    //   this.champName = result;

    //   this.filter = {
    //     title: result,
    //   };
    // });

    // this.requestTatamisInfo();
  }

  getData(){
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
      console.log(this.tatamies);
      
    });
  }

  async setTatamiCategory() { 
    let wait = document.getElementById('preloader');
    wait.style.display = 'block';
    // await this.saveChange();
    await this.saveChangeRenumber();  }

  async saveChange() {
    let wait = document.getElementById('preloader');
    this.tournamentService.setTatami({
        title: this.filter?.title,
        data: this.tatamies,
        renumber : false
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
        renumber : true
      })
      .subscribe((response) => {
          wait.style.display = 'none';
    });
  }

  ngOnDestroy(): void {}

  drop(event: CdkDragDrop<string[]>) {
    let up = event.container.data;
    console.log(up);
    
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
    console.log(down);
    this.saveChange()
  }

  changeLevelSelect(value){
    switch(value){
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

  selectDataByLevel(){
    this.tournamentService.selectDataByLevel(
      this.filter
    )
    .subscribe((response) => {
        
  });

  }

  createcopychamp(){
    this.tournamentService.createCopyChamp(
      this.filter
    )
    .subscribe((response) => {
        
  });

  }

}



