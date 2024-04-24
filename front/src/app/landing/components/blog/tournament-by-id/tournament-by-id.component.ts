/**
 * @author Ilya
 */
import { Component, Input, OnInit } from '@angular/core';
import { Tournament } from './../../../interfaces/tournaments';
import { BlogService } from './../../../services/blog.service';

@Component({
  selector: 'app-tournament-by-id',
  templateUrl: './tournament-by-id.component.html',
  styleUrls: ['./tournament-by-id.component.scss']
})
export class TournamentByIdComponent implements OnInit {

  // tournaments = {} as Tournament;
  @Input('tournament') tournament: Tournament | undefined;

  constructor(public blogService: BlogService) { }

  ngOnInit(): void {

  }

}
