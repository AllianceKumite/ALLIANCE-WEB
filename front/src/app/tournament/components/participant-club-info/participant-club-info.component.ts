import { Component, Input, ViewEncapsulation, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'app-participant-club-info',
  templateUrl: './participant-club-info.component.html',
  styleUrls: ['./participant-club-info.component.css'],
  encapsulation: ViewEncapsulation.None,
  // https://codecraft.tv/courses/angular/components/templates-styles-view-encapsulation/
})
export class ParticipantClubInfoComponent implements OnChanges, OnInit {
  @Input() withCoach : boolean = false;
  @Input() club: string;
  @Input() coach: string;

  showCoach: boolean = false;
  ngOnChanges() { 
    // this.showCoach = this.withCoach === 'true';

  };

  ngOnInit() {
    // console.log('ParticipantClubInfoComponen-withcoach', this.withCoach);
    // this.withCoach = false;
  }
}
