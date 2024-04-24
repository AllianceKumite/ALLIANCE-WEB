import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

// setDefaultPicture
@Component({
  selector: 'participant-photo',
  templateUrl: './participant-photo.component.html',
  styleUrls: ['./participant-photo.component.css']
})
export class ParticipantPhotoComponent implements OnInit {
  @Input()
  src: string = ''

  // @Input()
  // viewType: string;

  readonly logosDir = `${environment.logosDir}`;

  errorIsHandled = false;

  ngOnInit(): void {
  }

  setDefaultPicture(e) {
    if (!this.errorIsHandled) {
        this.errorIsHandled = true;
        e.target.src = this.logosDir + '/default-photo.svg';
    }
  }
}
