import { Component, OnInit, Input, ViewChild, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser'
import { environment } from 'src/environments/environment';
import { ConfirmService } from '../../services/confirm.service';
import { TournamentService } from '../../services/tournament.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { faShareFromSquare } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'participant-fight-manager-mark',
  templateUrl: './participant-fight-manager-mark.component.html',
  styleUrls: ['./participant-fight-manager-mark.component.css']
})
export class ParticipantFightManagerMarkComponent implements OnInit {
  @Input()
  info;

  @Input()
  viewType: string;

  @Input()
  akaShiroType: string;

  @Input()
  showExtendedInfo: boolean;

  @Input()
  passed: boolean;

  @Input()
  fight: string;

  @Input()
  onWinner;

  @Input() addWindow: Function

  faShareFromSquare = faShareFromSquare;

  @ViewChild('judge1') judge1;

  title: string;
  reactiveForm = new FormGroup({
    judge1 : new FormControl(0),
    judge2 : new FormControl(0),
    judge3 : new FormControl(0),
    judge4 : new FormControl(0),
    refery : new FormControl(0)
  });

  max: number = 0;
  min: number = 0;
  avg: number = 0;

  constructor(
      private activeRoute: ActivatedRoute,
      private tournamentService: TournamentService,
      private сonfirmService: ConfirmService,
      private sanitizer: DomSanitizer,
      private translateService: TranslateService
  ) {}

  readonly logosDir: string = `${environment.logosDir}`;


  ngOnInit(): void {
      this.cleanUpMarks()

      // this.сonfirmService.listenForStopTimer(() => {
      //     this.cleanUpMarks()
      // })

      // this.сonfirmService.listenForResetButtons(() => {
      //     this.cleanUpMarks()
      // })

      this.reactiveForm.valueChanges.subscribe(selectedValue => this.recalculate(selectedValue))
  }

  ngOnChanges(changes: SimpleChanges) {
      this.cleanUpMarks()

      this.ngAfterViewInit()
  }

  ngAfterViewInit() {
      if (this.judge1 && this.judge1.nativeElement) {
          this.judge1.nativeElement.focus();
          this.judge1.nativeElement.select();
      }
  }

  recalculate(selectedValue) {
      let sorted = [selectedValue.judge1, selectedValue.judge2, selectedValue.judge3, selectedValue.judge4, selectedValue.refery]
          .sort()

      this.min = sorted[0];
      this.max = sorted[sorted.length - 1];
      sorted = sorted.splice(1, 3);
      this.avg = Math.trunc((sorted.reduce((a, b) => a + b, 0) / sorted.length) * 1000)/1000
  }

  cleanUpMarks() {
      this.reactiveForm.setValue({
        judge1: 0,
        judge2: 0,
        judge3: 0,
        judge4: 0,
        refery: 0,
      });
  }

  getPoints() {
      let value = <any>(this.reactiveForm.value)

      value.avg = this.avg;

      return value
  }


  confirmWinner () {
      this.сonfirmService.pauseTimer(null);

      let color = this.akaShiroType == "aka" ? "red" :
          (this.akaShiroType == "shiro" ? "dodgerblue" : "black");
      var style = "<span style='color:" + color + "; font-weight: 800'>";
      var styleEnd = "</span>"
      let points = this.getPoints()

      this.translateService.get('manage.confirmWinnerMarks', {
          FIO: style + this.info.FIO + styleEnd,
          points: points.judge1 + ', ' + points.judge2 + ', ' + points.judge3 + ', ' + points.judge4 + ', ' + points.refery
      }).subscribe((confirmMessage: string) => {
          this.сonfirmService.confirm(
              this.sanitizer.bypassSecurityTrustHtml(confirmMessage),
              () => { /* this.winnnerConfirmed() */
                  this.cleanUpMarks();

                  if (typeof this.onWinner == 'function') {
                      this.onWinner(points)
                  }
              },
              () => { /* this.winnnerDeclined()*/
              }
          );
      });
  }
}
