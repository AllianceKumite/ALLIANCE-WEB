/**
 * @author Ilya
 */
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Tournament } from './../../../interfaces/tournaments';
import { HomeService } from './../../../../shared/services/home.service';
// import { NgOptimizedImage } from '@angular/common';


@Component({
  selector: 'app-tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.scss'],
})

export class TournamentComponent implements OnInit {
  @Input('tournament') tournament!: Tournament;
  id!: number;

  @Input()
  colorVariant;
  endRegistration : boolean = false;

  constructor(public router: Router, public homeService: HomeService) {}

  readonly mediaDir = `${environment.mediaDir}`;

  ngOnInit(): void {
    this.isEndRegistration();
  }

  goToTournament(id: string) {
    this.homeService.cleanCache();
    this.router.navigate([`/champ/${id}/`]);
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

  isEndRegistration(){
    this.endRegistration = Date.now() > this.tournament.dateEndReg;
  }

  getDateSting(date) {
    let df = new Date();

    df.setTime(date);

    return df.toLocaleString(undefined, {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
  }

}
