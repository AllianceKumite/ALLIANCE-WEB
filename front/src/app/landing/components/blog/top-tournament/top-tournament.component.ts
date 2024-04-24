/**
 * @author Ilya
 */
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Tournament } from './../../../interfaces/tournaments';
import { BlogService } from './../../../services/blog.service';
import { HomeService } from './../../../../shared/services/home.service';


@Component({
  selector: 'app-top-tournament',
  templateUrl: './top-tournament.component.html',
  styleUrls: ['./top-tournament.component.scss'],
})
export class TopTournamentComponent implements OnInit {
  readonly mediaDir = `${environment.mediaDir}`;

  @Input()
  tournament: Tournament;

  topTournament: Tournament[] = [];
  id!: number;

  timer;

  diffDays;
  diffHours;
  diffMinutes;
  diffSeconds;

  constructor(
    public blogService: BlogService,
    public router: Router,
    public homeService: HomeService
  ) {}

  ngOnInit(): void {
    this.setTimerLeft(this.tournament.date);
    

    // this.timer = setInterval(() => {
    //     this.setTimerLeft(this.tournament.date);
    // }, 1000)

    // TODO
    // this.blogService.getTournaments().subscribe((res: any) => this.topTournament = res["topTournament"]);
  }

  // goToTournament(id: number){
  goToTournament(id: string) {
    // this.router.navigate([`tournament/${id}`]);
    this.homeService.cleanCache();
    this.router.navigate([`/champ/${id}`]);
    // window.location.reload();
  }

  // TODO: do not copy paste
  getDateSting(date) {
    let d = new Date();

    d.setTime(date);

    return d.toLocaleDateString();
  }

  getFullDateSting(dateFrom, dateTo) {
    let df = new Date();
    let dt = new Date();

    df.setTime(dateFrom);
    dt.setTime(dateTo);

    if (df.getDay() === dt.getDay()) {
      return dt.toLocaleString(undefined, {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
      });
    } else {
      return (
        df.toLocaleString(undefined, {
          day: '2-digit',
        }) +
        '-' +
        dt.toLocaleString(undefined, {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
        })
      );
    }
  }

  setTimerLeft(date) {
    let diffTime = date - Date.now();

    if (diffTime > 0) {
      let diffDaysExact = diffTime / (1000 * 3600 * 24);
      this.diffDays = Math.trunc(diffDaysExact);

      let diffHoursTime = diffTime - this.diffDays * (1000 * 3600 * 24);
      let diffHoursExact = diffHoursTime / (1000 * 60 * 60);
      this.diffHours = Math.trunc(diffHoursExact);

      let diffMinutesTime = diffHoursTime - this.diffHours * 1000 * 3600;
      let diffMinutesExact = diffMinutesTime / (1000 * 60);
      this.diffMinutes = Math.trunc(diffMinutesExact);

      let diffSecondsTime = diffMinutesTime - this.diffMinutes * 1000 * 60;
      let diffSecondsExact = diffSecondsTime / 1000;
      this.diffSeconds = Math.trunc(diffSecondsExact);
    } else {
      // clearInterval(this.timer )
      this.diffSeconds = 0;
      this.diffMinutes = 0;
      this.diffHours = 0;
      this.diffDays = 0;
    }
  }

  getDaysLeft() {
    return this.diffDays;
  }

  getHoursLeft() {
    return this.diffHours;
  }

  getMinutesLeft() {
    return this.diffMinutes;
  }

  getSecondsLeft() {
    return this.diffSeconds;
  }
}
