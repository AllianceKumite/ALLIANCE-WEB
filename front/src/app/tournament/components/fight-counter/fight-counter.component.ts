import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { FightDetails } from '../../models/fightDetails.model';
import { FormBuilder } from '@angular/forms';
import { ConfirmService } from './../../services/confirm.service';
import { TournamentService } from '../../services/tournament.service';
import {
  faPlay,
  faPause,
  faStop,
  faShareFromSquare,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'fight-counter',
  templateUrl: './fight-counter.component.html',
  styleUrls: ['./fight-counter.component.css'],
})
export class FightCounterComponent implements OnInit {
  @Input() duration;

  @Input() fightNum: number;
  @Input() addWindow: Function;
  @Input() champName: string;
  @Input() tatamiId: number;
  @Input() katagroup: number;
  @Input() count : number;

  showTime;

  durations;

  numRound;

  SECONDS_ID = 'seconds';

  timerMax = 0;
  timerCurrent = 0;
  timerHandle = null;

  isPaused = false;
  isStarted = false;
  timerForm = this.fb.group({ timeDuration: 0 });

  startEnabled = true;
  pauseEnabled = false;
  stopEnabled = false;

  faPlay = faPlay;
  faPause = faPause;
  faStop = faStop;

  faShareFromSquare = faShareFromSquare;

  subscriptions = [];
  MILISECONDS = 1000;

  minutes: number = 0;
  seconds: number = 0;

  posttime: any;
  constructor(
    public fb: FormBuilder,
    private сonfirmService: ConfirmService,
    private tournamentService: TournamentService
  ) {}

  ngOnInit(): void {
    let s1 = this.сonfirmService.listenForResetTimer((msg: string) => {
      this.resetTimer();
    });
    let s2 = this.сonfirmService.listenForPauseTimer((msg: string) => {
      this.pauseTick();
    });

    this.subscriptions.push(s1);
    this.subscriptions.push(s2);

    // this.tournamentService
    //   .setTatamiTime(this.tatamiId, 0, this.champName)
    //   .subscribe((response) => {
    //   });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((x) => {
      if (!x.closed) {
        x.unsubscribe();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.showTime = this.katagroup <= 0;
    
    if (this.duration) {
      this.durations = this.duration.split(',').map((d) => {
        return d == null || d == 'None' || d == 0 || d == -1 ? '60' : d;
      });
    } else {
      this.durations = ['60', '60', '60', '60'];
    }

    this.resetTimer();
  }

  setNumRound(numRound) {
    this.numRound = numRound;
    this.сonfirmService.sendCurrentFightUpdate({ numRound: this.numRound });
  }

  resetTimer() {
    this.setNumRound(0);

    if (this.durations) {
      this.timerForm.controls.timeDuration.setValue(
        this.durations[this.numRound]
      );
      this.сonfirmService.sendCurrentFightUpdate({
        time: this.durations[this.numRound],
      });
    }

    this.setUpDuration();
  }

  setUpDuration() {
    this.timerMax = this.timerForm.value.timeDuration;
    this.setCurrentTime(this.timerMax);
    this.endTick();
  }

  handleChange($event) {
    this.setUpDuration();
  }

  handleStart(event) {
    this.startTick();
    this.disableDurationChange();
  }

  handlePauseCont(event) {
    this.pauseResumeTick();
  }

  handleStop(event) {
    this.resetTimer();
  }

  setManageBtnsEnabled(enabled) {
    this.сonfirmService.enableAndActivateWinnerButtons(enabled);
  }

  disableDurationChange() {
    this.timerForm.disable();
    this.setManageBtnsEnabled(false);
  }

  enableDurationChange() {
    this.timerForm.enable();
    this.setManageBtnsEnabled(true);
  }

  ////////////////////////////////////////////////////////////////////
  // Timer functions
  // TODO: Move to separate component
  // let max = this.timerMax;

  // public
  startTick() {
    this.сonfirmService.resetButtons();
    this.setCurrentTime(this.timerMax);
    this.beginTick();
  }

  getTimerString() {
    return (
      this.minutes.toString().padStart(2, '0') +
      ':' +
      this.seconds.toString().padStart(2, '0')
    );
  }

  setCurrentTime(time) {
    this.timerCurrent = time;
    //   this.showTimer(0, 1, 30);
    this.minutes = Math.floor(this.timerCurrent / 60);
    this.seconds = this.timerCurrent - this.minutes * 60;
    // this.tournamentService
    //   .setTatamiTime(this.tatamiId, this.timerCurrent, this.champName)
    //   .subscribe((response) => {
    //     // console.log(response);
    //   });

    this.drawCounterAtPosition(this.timerCurrent, this.timerMax);
    this.сonfirmService.sendCurrentFightUpdate({ time: this.timerCurrent });
  }

  // public
  stopTick() {
    this.endTick();
    this.setCurrentTime(0);
  }

  // public
  pauseResumeTick() {
    if (this.isPaused) {
      this.resumeTick();
    } else {
      this.pauseTick();
    }
  }

  // public
  pauseTick() {
    if (this.isStarted) {
      if (!this.isPaused) {
        this.endTick();
        this.isPaused = true;
        this.isStarted = true;
        this.updatePlayerButtonsEnabled();
        this.disableDurationChange();
      }
    }
  }

  // public
  resumeTick() {
    if (this.isStarted) {
      if (this.isPaused) {
        this.isPaused = false;

        this.beginTick();
        this.updatePlayerButtonsEnabled();
      }
    }
  }

  // private
  beginTick() {
    this.isStarted = true;
    this.updatePlayerButtonsEnabled();
    this.disableDurationChange();
    // Set an interval timer to decrement the count and redraw the graph every second
    if (this.timerHandle == null) {
      this.timerHandle = window.setInterval(() => {
        let timerCurrent = this.timerCurrent - 1;

        if (timerCurrent == 0) {
          let numRound = (this.numRound + 1) % 4;

          if (numRound != 0) {
            this.setNumRound(numRound);
            this.timerForm.controls.timeDuration.setValue(
              this.durations[this.numRound]
            );
            this.setUpDuration();
          } else {
            this.endTick(true);
          }
        }

        this.setCurrentTime(timerCurrent);
      }, this.MILISECONDS);
    }
  }

  // private
  endTick(disableDuration?) {
    clearTimeout(this.timerHandle);
    this.timerHandle = null;
    this.isStarted = false;
    this.isPaused = false;

    this.updatePlayerButtonsEnabled(disableDuration);

    if (disableDuration !== true) {
      this.enableDurationChange();
    } else {
      this.setManageBtnsEnabled(true);
    }
  }

  updatePlayerButtonsEnabled(forceDisabled?) {
    forceDisabled =
      typeof forceDisabled !== 'undefined' && forceDisabled == true
        ? true
        : false;

    this.startEnabled = !this.isStarted && !forceDisabled;
    this.pauseEnabled = this.isStarted && !forceDisabled;
    this.stopEnabled = this.isStarted && !forceDisabled;
  }

  // private
  drawCounterAtPosition(position, total) {
    let id = this.SECONDS_ID;

    var circle = document.getElementById(id);
    // Get the radius ("r" attribute)

    if (circle) {
      position = total - position;
      const radius = +circle.getAttribute('r');

      // var radius = elem.r.baseVal.value;
      // Calculate the circumference of the circle
      var circumference = radius * 2 * Math.PI;
      // How long the bar has to be
      var barLength = (position * circumference) / total;

      // Set a dash pattern for the stroke.
      // The dash pattern consists of a dash of the right length,
      // followed by a gap big enough to ensure that we don't see the next dash.
      circle.setAttribute(
        'stroke-dasharray',
        0 + ' ' + barLength + ' ' + circumference
      );
    }
  }
}
