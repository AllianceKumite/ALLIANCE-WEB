import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser'
import { environment } from 'src/environments/environment';
import { ConfirmService } from '../../services/confirm.service';
import { TournamentService } from '../../services/tournament.service';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';

// TODO:

@Component({
  selector: 'participant-flags',
  templateUrl: './participant-flags.component.html',
  styleUrls: ['./participant-flags.component.css']


})
export class ParticipantFlagsComponent {
  @Input() marks;
  @Input() akaShiroType;
}

