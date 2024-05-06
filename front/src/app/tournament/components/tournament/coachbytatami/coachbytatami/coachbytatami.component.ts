import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HomeService } from 'src/app/shared/services/home.service';
import { UtilService } from 'src/app/shared/services/util.service';
import { TournamentService } from '../../../../services/tournament.service';
import { Subscription } from 'rxjs';
import { Tatami } from 'src/app/tournament/models/tatami.model';
import { OnlineService } from 'src/app/tournament/services/online.service';

@Component({
  selector: 'app-coachbytatami',
  templateUrl: './coachbytatami.component.html',
  styleUrls: ['./coachbytatami.component.css']
})
export class CoachbytatamiComponent implements OnInit, AfterViewInit {
  subscription: Subscription;
  nameOfChampionship;
  coaches: any[] = [];
  clubs: any[] = [];
  participants: any[] = [];
  tatamies: Tatami[];

  selectedClub;
  selectedCoach;

  firstName;
  lastName;


  constructor(
    private tournamentService: TournamentService,
    private activeRoute: ActivatedRoute,
    private homeService: HomeService,
    private translateService: TranslateService,
    private utilService: UtilService,
    private cdref: ChangeDetectorRef
  ) {
  }

  ngAfterViewInit(): void {

  }
  
  ngOnInit(): void {
    // this.restoreFromLocalStorage();

    this.activeRoute.parent.params.subscribe(params => {
      const name = params['name'];
      this.nameOfChampionship = name;
    })

    this.tournamentService
      .getClubs({ title: this.nameOfChampionship })
      .subscribe((response) => {
        this.clubs = Object.values(response);
        this.clubs.sort(function (a, b) {
          return a.ClubId - b.ClubId
        });
      });

    this.tournamentService
      .getCoaches({ title: this.nameOfChampionship })
      .subscribe((response) => {
        this.coaches = Object.values(response);
        this.coaches.sort(function (a, b) {
          var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase()
          if (nameA < nameB) //сортируем строки по возрастанию
            return -1
          if (nameA > nameB)
            return 1
          return 0 // Никакой сортировки
        })
      });

    this.tournamentService.getTatami({ title: this.nameOfChampionship }).subscribe(response => {
      this.tatamies = Object.values(response)
      this.tournamentService.getTatamisCurrentFight({ title: this.nameOfChampionship }).subscribe(response => {
        this.updateTatamisCurrentFights(response);
        let club = localStorage.getItem('nextfightselectedClub');
        let coach = localStorage.getItem('nextfightselectedCoach');

        if (club) {
          this.selectedCoach = undefined;
          this.selectedClub = Number(club);
          this.cdref.detectChanges();

          this.changeClub();
        };
        if (coach) {
          this.selectedClub = undefined;
          this.selectedCoach = Number(coach);
          this.cdref.detectChanges();
          this.changeCoach();
        };
      });
    });
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

  changeClub() {
    this.selectedCoach = undefined;
    if (this.selectedClub) {
      this.saveToLocalStorage();
      this.tournamentService
        .getNextFightsByClub({ title: this.nameOfChampionship, clubid: this.selectedClub })
        .subscribe((response) => {
          this.participants = Object.values(response);
          this.participants = this.participants.map((p: any) => {
            if (p.FIO) {
              p.FIO = this.getFIO(p.FIO);
            }
            return p;
          })
        });
    }
  }

  parseFio(FIO) {
    let splitted = FIO?.split(' ');
    this.lastName = splitted?.length > 0 ? splitted[1] : '';
    this.firstName = splitted?.length > 1 ? splitted[0] : '';
  }

  getFIO(FIO) {
    this.parseFio(FIO);
    return this.firstName + ' ' + this.lastName;
  }

  changeCoach() {
    this.selectedClub = undefined;
    if (this.selectedCoach) {
      this.saveToLocalStorage();
      this.tournamentService
        .getNextFightsByCoach({ title: this.nameOfChampionship, coachid: this.selectedCoach })
        .subscribe((response) => {
          this.participants = Object.values(response);
          this.participants = this.participants.map((p: any) => {
            if (p.FIO) {
              p.FIO = this.getFIO(p.FIO);
            }
            return p;
          })
        });
    }
  }

  saveToLocalStorage() {
    localStorage.setItem('nextfightselectedClub', this.selectedClub);
    localStorage.setItem('nextfightselectedCoach', this.selectedCoach);
  }

  restoreFromLocalStorage() {
    let club = localStorage.getItem('nextfightselectedClub');
    let coach = localStorage.getItem('nextfightselectedCoach');
  }

}