import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser'
import { environment } from 'src/environments/environment';
import { ConfirmService } from './../../services/confirm.service';
import { TournamentService } from './../../services/tournament.service';
import { faTrophy } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { SelectedkataService } from '../../services/selectedkata.service';

@Component({
  selector: 'participant-fight-manager-flag',
  templateUrl: './participant-fight-manager-flag.component.html',
  styleUrls: ['./participant-fight-manager-flag.component.css']
})
export class ParticipantFightManagerFlagComponent implements OnInit {
  @Input()
  info;

  @Input()
  akaShiroType: string;

  @Input()
  fight;

  @Input()
  onWinner;

  @Input()
  details;

  faTrophy = faTrophy;

  title;

  timeStamp: number = 0;

  constructor(
      private activeRoute: ActivatedRoute,
      private сonfirmService: ConfirmService,
      private sanitizer: DomSanitizer,
      private translateService: TranslateService,
      private selectedkataService: SelectedkataService,
      private tournamentService: TournamentService,
  ) {}

  readonly logosDir: string = `${environment.logosDir}`;

  CLASS_PREFIX = 'btn btn-sm';
  OFF_CLASS = 'btn-secondary';
  ON_CLASS_YELLOW = 'btn-warning';
  ON_CLASS_RED = 'btn-danger';
  ON_CLASS_GREEN = 'btn-success';
  ON_CLASS_BLUE = 'btn-primary';
  ON_CLASS_AKA = 'btn-danger'
  ON_CLASS_SHIRO = 'btn-primary'
  OFF_CLASS_AKA_SHIRO = 'btn-secondary';
//   ON_CLASS_AKA = 'btn-outline-danger'
//   ON_CLASS_SHIRO = 'btn-outline-primary'
//   OFF_CLASS_AKA_SHIRO = 'btn-outline-secondary';

  @ViewChild('btns') btns;
  btnsArray;

  subscriptions = []

  ngOnInit(): void {
      this.activeRoute.parent.params.subscribe(params => {
          this.title = params["name"];
      });

      this.fillInBtns()
      this.cleanUpBtns()

      let s1 = this.сonfirmService.listenForStopTimer(() => {
          this.cleanUpBtns()
      })

      let s2 = this.сonfirmService.listenForResetButtons(() => {
          this.cleanUpBtns()
      })

      let s3 = this.сonfirmService.listenForWinnerButtons(() => {
          this.setWinnersBtnEnabledAndActivated(this.сonfirmService.winnerBtnEnabledAndActivated)
      })

      this.subscriptions.push(s1)
      this.subscriptions.push(s2)
      this.subscriptions.push(s3)
      
  }

  ngOnDestroy() {
      this.subscriptions.forEach(x => {
          if(!x.closed) {
              x.unsubscribe();
          }
      });
  }

  cleanUpBtns() {
      this.fillInBtns()

      if (this.btnsArray) {
          for (var i = 0; i < this.btnsArray.length - 1; i++)
          // for (let btn of this.btnsArray)
              this.setActivated(this.btnsArray[i], false);

          this.updateAvailability(null);
          this.setWinnersBtnEnabledAndActivated(true);
      }

      let marks = {}
      marks[this.akaShiroType] = { ippon: false, vazari: false, ch1: false, ch2: false, genten: false, sikaku: false };
      this.сonfirmService.sendCurrentFightUpdate({marks: marks})
  }

  setWinnersBtnEnabledAndActivated(enabled) {
      this.fillInBtns()

      if (typeof this.btnsArray !== 'undefined') {
          this.setEnabled(this.btnsArray[this.btnsArray.length - 1], enabled);
          this.setActivated(this.btnsArray[this.btnsArray.length - 1], enabled);
      }
  }

  isEnabled(btnElement) {
      return (btnElement?.getAttribute("disabled") !== 'disabled')
  }

  isDisabled(btnElement) {
      return (btnElement?.getAttribute("disabled") == 'disabled')
  }

  enableBtn(btnElement) {
      btnElement?.removeAttribute("disabled");
  }

  disableBtn(btnElement) {
      btnElement?.setAttribute("disabled", 'disabled');
  }

  setEnabled(btnElement, enabled) {
    if (enabled) {
        if (this.isDisabled(btnElement)) {
            this.enableBtn(btnElement)
        }
    } else {
      if (this.isEnabled(btnElement)) {
          this.disableBtn(btnElement)
      }
    }
  }

  isOn(btnElement) {
      let on = false;

      if (btnElement) {
          let clazz = btnElement.getAttribute('class');
          let ON_CLASS = this.getActiveClass(btnElement);
          let clazzIndex = clazz.indexOf(ON_CLASS);

          on = clazzIndex > 0;
      }

      return on
  }

  isOff(btnElement) {
    let off = false;

    if (btnElement) {
        let clazz = btnElement.getAttribute('class');
        let OFF_CLASS = this.getInactiveClass(btnElement);
        let clazzIndex = clazz.indexOf(OFF_CLASS);

        off = clazzIndex > 0;
    }

    return off
  }

  getBtnType(btnElement) {
    return btnElement.value;
  }

  getActiveClass(btnElement) {
    let btnTxt = btnElement?.value;
    // let btnTxt = btnElement?.content;
    // let btnTxt = btnElement?.innerText.toUpperCase();
    

    if (btnElement.getAttribute('class').indexOf('ripple-surface') > -1 ) {
      btnElement = btnElement.children[0];
    }

    this.fillInBtns()

    let c1 : string = this.btnsArray[0]?.value;
    let c2 : string= this.btnsArray[1]?.value;
    let c3 : string= this.btnsArray[2]?.value;
    let g : string= this.btnsArray[3]?.value;
    let s : string= this.btnsArray[4]?.value;
    let v1 : string= this.btnsArray[5]?.value;
    let v2 : string= this.btnsArray[6]?.value;
    let i : string= this.btnsArray[7]?.value;
    let winner : string= this.btnsArray[8]?.value;

    let ON_CLASS = '';

    if (btnTxt == c1 || btnTxt == c2 || btnTxt == c3) {
        ON_CLASS = this.ON_CLASS_YELLOW;
    } else if (btnTxt == g || btnTxt == s) {
        ON_CLASS = this.ON_CLASS_RED;
    } else if (btnTxt == v1 || btnTxt == v2) {
        ON_CLASS = this.ON_CLASS_GREEN;
    } else if (btnTxt == i) {
        ON_CLASS = this.ON_CLASS_BLUE;
    } else if (btnTxt == winner) {
        let id =  btnElement.getAttribute("id");
        if (id?.indexOf("aka") > -1) {
            ON_CLASS = this.ON_CLASS_AKA;
        } else if (id?.indexOf("shiro") > -1) {
            ON_CLASS = this.ON_CLASS_SHIRO;
        }
    }

    return ON_CLASS;
  }

  getInactiveClass(btnElement) {
    let btnTxt = btnElement?.value;
      if (btnElement.getAttribute('class').indexOf('ripple-surface') > -1 ) {
        btnElement = btnElement.children[0];
      }

      this.fillInBtns()

      let c1 = this.btnsArray[0]?.value;
      let c2 = this.btnsArray[1]?.value;
      let c3 = this.btnsArray[2]?.value;
      let g = this.btnsArray[3]?.value;
      let s = this.btnsArray[4]?.value;
      let v1 = this.btnsArray[5]?.value;
      let v2 = this.btnsArray[6]?.value;
      let i = this.btnsArray[7]?.value;
      let winner = this.btnsArray[8]?.value;

      let OFF_CLASS='';

      if (btnTxt == c1 || btnTxt == c2 || btnTxt == c3 ||
        btnTxt == g || btnTxt == s || btnTxt == v1 ||
        btnTxt == v2 || btnTxt == i) {
            OFF_CLASS = this.OFF_CLASS;
      } else if (btnTxt == winner) {
          OFF_CLASS = this.OFF_CLASS_AKA_SHIRO;
      }

      return OFF_CLASS;
  }

  setActivated(btnElement, active) {
    if (btnElement) {


        if (btnElement.getAttribute("class").indexOf("ripple-surface") != -1) {
              btnElement = btnElement.children[0]
        }

        let ON_CLASS = this.getActiveClass(btnElement);
        let OFF_CLASS = this.getInactiveClass(btnElement);

        let clazz = btnElement.getAttribute('class');

        if (active) {
          let clazzIndex = clazz.indexOf(ON_CLASS);

          let isOn = clazzIndex > 0;

          if (!isOn) {
              clazz = this.CLASS_PREFIX + " " + ON_CLASS
              btnElement.setAttribute('class', clazz);
          }
        } else {
          let clazzIndex = clazz.indexOf(OFF_CLASS);

          let isOff = clazzIndex > 0;

          if (!isOff) {
              clazz = this.CLASS_PREFIX + " " + OFF_CLASS
              btnElement.setAttribute('class', clazz);
          }
        }
    }
  }

  switchActivated(btnElement) {
      let clazz = btnElement.getAttribute('class');
      let OFF_CLASS = this.getInactiveClass(btnElement);
      let clazzIndex = clazz.indexOf(OFF_CLASS);
      let isOff = clazzIndex > 0;
      let ON_CLASS = this.getActiveClass(btnElement);

      if (isOff) {
          clazz = this.CLASS_PREFIX + " " + ON_CLASS;
          
          btnElement.setAttribute('class', clazz);
      } else {
        clazzIndex = clazz.indexOf(ON_CLASS);

        let isOn = clazzIndex > 0;

        if (isOn) {
            clazz = this.CLASS_PREFIX + " " + OFF_CLASS;
            btnElement.setAttribute('class', clazz);
        }
      }
  }

  changeStateManageBtn($event) {
   
      if ($event.timeStamp - this.timeStamp> 10) {
          this.timeStamp = $event.timeStamp;
          this.switchActivated($event.target);
          this.updateAvailability($event.target);
          this.updateSwitchers()

          let marks = {}
          marks[this.akaShiroType] = this.getSwitchersForCurrentFightWnd();

          this.сonfirmService.sendCurrentFightUpdate({marks: marks})
      }

      $event.stopPropagation();
      return false;
  }

  fillInBtns() {
      if (typeof this.btnsArray == 'undefined' || this.btnsArray.length == 0) {
        var btnsArray = this.btns?.nativeElement?.children;
        this.btnsArray = [];

        for (var b in btnsArray) {
          if ((Number)(b) >= 0 && (Number)(b) <= 8 && btnsArray[b].getAttribute("class").indexOf("ripple-surface") > -1) {
            this.btnsArray[b] =  btnsArray[b].children[0];
          } else {
            this.btnsArray[b] =  btnsArray[b];
          }
        }
      }

      return this.btnsArray
  }

  updateAvailability(btnClicked) {
      this.fillInBtns()

      let c1 = this.btnsArray[0];
      let c2 = this.btnsArray[1];
      let c3 = this.btnsArray[2];
      let g = this.btnsArray[3];
      let s = this.btnsArray[4];

      if (c1 && c2 && c3 && s && g) {
          // 0 0 0
          if (this.isOff(c1) && this.isOff(c2) && this.isOff(c3)) {
            if (this.isDisabled(c1)) {
                this.enableBtn(c1)
            }

            if (this.isEnabled(c2)) {
                this.disableBtn(c2)
            }

            if (this.isEnabled(c3)) {
                this.disableBtn(c3)
            }
          } else
          // 1 0 0
          if (this.isOn(c1) && this.isOff(c2) && this.isOff(c3)) {
            if (this.isDisabled(c1)) {
              this.enableBtn(c1)
            }

            if (this.isDisabled(c2)) {
                this.enableBtn(c2)
            }

            if (this.isEnabled(c3)) {
                this.disableBtn(c3)
            }
          } else
          // 1 1 0
          if (this.isOn(c1) && this.isOn(c2) && this.isOff(c3)) {
            if (this.isEnabled(c1)) {
              this.disableBtn(c1)
            }

            if (this.isDisabled(c2)) {
                this.enableBtn(c2)
            }

            if (this.isDisabled(c3)) {
                this.enableBtn(c3)
            }
          } else
          // 1 1 1
          if (this.isOn(c1) && this.isOn(c2) && this.isOn(c3)) {
              if (this.isOff(g)) {
                  // this.disableBtn(g)
                  this.setActivated(g, true);
                  this.setActivated(c1, false);
                  this.setActivated(c2, false);
                  this.setActivated(c3, false);
                  this.enableBtn(c1);
                  this.disableBtn(c2);
                  this.disableBtn(c3);
              } else if (this.isOn(g)) {
                  this.setActivated(s, true);
                  this.enableBtn(c1);
                  this.disableBtn(c2);
                  this.disableBtn(c3);
                  // this.setActivated(g, true);
                  this.setActivated(c1, false);
                  this.setActivated(c2, false);
                  this.setActivated(c3, false);
              }
          }
      }

      let v1 = this.btnsArray[5];
      let v2 = this.btnsArray[6];
      let i = this.btnsArray[7];

      if (v1 && v2 && i) {
          // 0 0
          if (this.isOff(v1) && this.isOff(v2)) {
              this.enableBtn(v1)
              this.disableBtn(v2)
          } else if (this.isOn(v1) && this.isOff(v2)) {
              // 0 1
              this.enableBtn(v1)
              this.enableBtn(v2)

              if (btnClicked == v2) {
                  this.setActivated(i, false);
              }
          } else if (this.isOn(v1) && this.isOn(v2)) {
            // 1 1
            this.disableBtn(v1);

            if (btnClicked == v2) {
                this.setActivated(i, true);
            } else if (btnClicked == i) {
                this.enableBtn(v2);
            }
          }

          if (this.isOn(i)) {
            this.disableBtn(v1);
            this.disableBtn(v2);
            this.confirmWinner();
          }
      }
  }

    getPoints() {
        let points = 2;

        if (this.btnsArray) {
            let v1 = this.btnsArray[5];
            let v2 = this.btnsArray[6];
            let i = this.btnsArray[7];

            points = this.isOn(v1) && this.isOff(v2) && this.isOff(i) ? 3 : (this.isOn(i) ? 4 : 2)
        }

        return points;
    }

    confirmWinner() {
        this.сonfirmService.pauseTimer(null);

        let color = this.akaShiroType == "aka" ? "red" :
            (this.akaShiroType == "shiro" ? "dodgerblue" : "black");
        let style = "<span style='color:" + color + "; font-weight: 800'>";
        let styleEnd = "</span>"

        let isCircle = this.details && this.details.CategoryType == 1 && this.details.Level < 8;
        let message = isCircle ? 'manage.confirmWinnerCircular' : 'manage.confirmWinner';

        this.translateService.get(message, {
            akaShiro: style + this.akaShiroType + styleEnd,
            FIO: style + this.info.FIO + styleEnd,
            points: style + this.getPoints() + styleEnd
        }).subscribe((confirmMessage: string) => {
            this.сonfirmService.confirm(
                this.sanitizer.bypassSecurityTrustHtml(confirmMessage),
                () => { /* this.winnnerConfirmed() */
                    this.onWinner(this.getPoints())
                },
                () => { /* this.winnnerDeclined()*/
                }
            );
        });
    }

    getSwitchers() {
        this.fillInBtns()

        let c1 = this.btnsArray[0];
        let c2 = this.btnsArray[1];
        let c3 = this.btnsArray[2];
        let g = this.btnsArray[3];
        let s = this.btnsArray[4];
        let v1 = this.btnsArray[5];
        let v2 = this.btnsArray[6];
        let i = this.btnsArray[7];
        let winner = this.btnsArray[8];

        return [
            this.isOn(c1) ? 1 : 0,
            this.isOn(c2) ? 1 : 0,
            this.isOn(c3) ? 1 : 0,
            this.isOn(v1) ? 1 : 0,
            this.isOn(v2) ? 1 : 0,
            this.isOn(i) ? 1 : 0
        ]
    }

    updateSwitchers() {
        this.tournamentService.updateSwitchers({
            title: this.title,
            fight: this.fight,
            akaShiro: this.akaShiroType == "aka" ? "R" : (this.akaShiroType == "shiro" ? "W" : null),
            switchers: this.getSwitchers()
        }).subscribe();
    }


    getSwitchersForCurrentFightWnd() {
      this.fillInBtns()

      let c1 = this.btnsArray[0];
      let c2 = this.btnsArray[1];
      let c3 = this.btnsArray[2];
      let g = this.btnsArray[3];
      let s = this.btnsArray[4];
      let v1 = this.btnsArray[5];
      let v2 = this.btnsArray[6];
      let i = this.btnsArray[7];
      let winner = this.btnsArray[8];
      // akaShiroType: this.akaShiroType,
      return {
          ippon: this.isOn(i),
          vazari: this.isOn(v1) || this.isOn(v2),
          ch1: this.isOn(c1),
          ch2: this.isOn(c2),
          genten: this.isOn(g),
          sikaku: this.isOn(s)
      }
    }
}

