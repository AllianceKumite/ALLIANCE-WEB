import { Component, Input, Output, ViewChild, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { FightDetails } from '../../models/fightDetails.model';
import { DrawService } from '../tournament/draw/draw-service'
import { environment } from 'src/environments/environment';
import { ConfirmService } from '../../services/confirm.service';
import { SelectedkataService } from '../../services/selectedkata.service';
import { KataGroup, Kata } from '../../models/katagroup.model'
import { TranslateService } from '@ngx-translate/core';
// import { ParticipantComponent } from '../participant/participant.component';

@Component({
  selector: 'fight',
  templateUrl: './fight.component.html',
  styleUrls: ['./fight.component.css'],
})
export class FightComponent implements OnChanges, OnInit {
  @Input() fight;
  // FightDetails = {
  //   red: null,
  //   white: null,
  //   details: null
  // };

  @Output() updateInfoLevel = new EventEmitter<number>();

  @Input()
  headerColor: string;

  @Input()
  viewType: string;

  @Input()
  champType: number;

  @Input()
  champName;

  @Input()
  tatamiId;

  @Input()
  categoryFilter;

  @Input()
  onSelectCallback;

  @Input()
  katas: Kata[] = [];

  @Input()
  katagroups: KataGroup[] = [];


  kataMandat: Kata[] = [];
  kataChoose: Kata[] = [];
  kataGroup: number;
  chooselevel: number;

  selectedKataIdAka;
  selectedKataIdShiro;

  selectedKataNameAka;
  selectedKataNameShiro;

  typeOlimp = environment.typeOlimp;
  typeCircle = environment.typeCircle;
  typeKata = environment.typeKata;
  typeWKB = environment.typeWKB;

  @Input() onCancel: Function;
  @Input() onPostpone: Function;
  @Input() onUnpostpone: Function;

  @Input() selectable: boolean = false;

  @Input() addWindow: Function;
  @Input() time: number;
  @Input() numRound: number;
  @Input() marks: any;
  @Input() fightcount: number;

  count;

  lng: string;

  constructor(
    private drawService: DrawService,
    private confirmService: ConfirmService,
    private translateService: TranslateService,
    private selectedkataService: SelectedkataService
  ) {
  }

  ngOnInit() {
    // console.log(this.fight);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.lng = localStorage.getItem('lng').toUpperCase();
    this.translateService.onLangChange.subscribe((event) => {
      this.lng = localStorage.getItem('lng').toUpperCase();
      this.getSelectedKataAka(this.selectedKataIdAka);
      this.getSelectedKataShiro(this.selectedKataIdShiro);
    });

    this.kataGroup = Number(this.fight?.details?.KataGroup);
    this.chooselevel = Number(this.fight?.details?.LevelCircle);



    this.buildKataGroup(this.kataGroup);
    // this.selectedkataService.selectedKataNameShiro = '';
    // this.selectedkataService.selectedKataNameAka = '';
    this.selectedKataIdAka = -1;
    this.selectedKataIdShiro = -1;
    this.getSelectedKataAka(this.selectedKataIdAka);
    this.getSelectedKataShiro(this.selectedKataIdShiro);

    if (this.viewType == 'manageFightInDetailsWithFlags') {
      this.confirmService.resetTimer('sds');
      this.confirmService.resetButtons();
    }
    if (this.viewType == 'currentFightWithTime') {
      // console.log('katagroup = ', this.kataGroup);      
    }

    this.isNotEmptyFight();
  }

  isNotEmptyFight(){
    return this.fight?.details?.KataGroup && this.fight?.details?.KataGroup >= 0;
  }

  getSelectedKataAka(kataId: number): void {
    this.selectedKataIdAka = kataId;
    let itemKata: Kata[];
    itemKata = this.katas.filter((item) => item.KataId == Number(this.selectedKataIdAka));
    this.selectedKataNameAka = '';
    if (itemKata && itemKata.length > 0) {
      if (this.lng.toUpperCase() === 'RU') {
        this.selectedKataNameAka = itemKata[0].KataNameRu
      }
      if (this.lng.toUpperCase() === 'UA') {
        this.selectedKataNameAka = itemKata[0].KataNameUa
      }
      if (this.lng.toUpperCase() === 'EN') {
        this.selectedKataNameAka = itemKata[0].KataNameEn
      }
    }
    this.selectedkataService.athIdAka = this.fight?.red?.athId;
    this.selectedkataService.selectedKataAka = this.selectedKataIdAka;
    this.selectedkataService.selectedKataNameAka = this.selectedKataNameAka;
  }

  getSelectedKataRefery(kataId: number): void {    
    this.selectedKataIdAka = kataId;
    this.selectedKataIdShiro = kataId;
    let itemKata: Kata[];
    itemKata = this.katas.filter((item) => item.KataId == Number(this.selectedKataIdAka));
    this.selectedKataNameAka = '';
    this.selectedKataNameShiro = '';
    if (itemKata && itemKata.length > 0) {
      if (this.lng.toUpperCase() === 'RU') {
        this.selectedKataNameAka = itemKata[0].KataNameRu
        this.selectedKataNameShiro = itemKata[0].KataNameRu
      }
      if (this.lng.toUpperCase() === 'UA') {
        this.selectedKataNameAka = itemKata[0].KataNameUa
        this.selectedKataNameShiro = itemKata[0].KataNameUa
      }
      if (this.lng.toUpperCase() === 'EN') {
        this.selectedKataNameAka = itemKata[0].KataNameEn
        this.selectedKataNameShiro = itemKata[0].KataNameEn
      }
    }
    this.selectedkataService.athIdAka              = this.fight?.red?.athId;
    this.selectedkataService.athIdShiro            = this.fight?.white?.athId;
    this.selectedkataService.selectedKataAka       = this.selectedKataIdAka;
    this.selectedkataService.selectedKataShiro     = this.selectedKataIdShiro;
    this.selectedkataService.selectedKataNameAka   = this.selectedKataNameAka;
    this.selectedkataService.selectedKataNameShiro = this.selectedKataNameShiro;
  }

  updateKata(level): void {
    this.updateInfoLevel.emit(level);

    // switch (Number(level)) {
    //   case 1:
    //     this.fight.red.lvl1 = this.selectedKataIdAka;
    //     this.fight.white.lvl1 = this.selectedKataIdShiro;
    //     break;
    //   case 2:
    //     this.fight.red.lvl2 = this.selectedKataIdAka;
    //     this.fight.white.lvl2 = this.selectedKataIdShiro;
    //     break;
    //   case 3:
    //     this.fight.red.lvl3 = this.selectedKataIdAka;
    //     this.fight.white.lvl3 = this.selectedKataIdShiro;
    //     break;
    //   case 4:
    //     this.fight.red.lvl4 = this.selectedKataIdAka;
    //     this.fight.white.lvl4 = this.selectedKataIdShiro;
    //     break;
    //   case 5:
    //     this.fight.red.lvl5 = this.selectedKataIdAka;
    //     this.fight.white.lvl5 = this.selectedKataIdShiro;
    //     break;
    //   case 6:
    //     this.fight.red.lvl6 = this.selectedKataIdAka;
    //     this.fight.white.lvl6 = this.selectedKataIdShiro;
    //     break;
    //  case 7:
    //     this.fight.red.lvl7 = this.selectedKataIdAka;
    //     this.fight.white.lvl7 = this.selectedKataIdShiro;
    //     break;
    //   case 8:
    //     this.fight.red.lvl8 = this.selectedKataIdAka;
    //     this.fight.white.lvl8 = this.selectedKataIdShiro;
    //     break;
    //   case 12:
    //     this.fight.red.lvl12 = this.selectedKataIdAka;
    //     this.fight.white.lvl12 = this.selectedKataIdShiro;
    //     break;
    // }
  }

  getSelectedKataShiro(kataId: number): void {
    this.selectedKataIdShiro = kataId;
    let itemKata: Kata[];
    itemKata = this.katas.filter((item) => item.KataId == Number(this.selectedKataIdShiro));
    this.selectedKataNameShiro = '';
    if (itemKata && itemKata.length > 0) {
      if (this.lng.toUpperCase() === 'RU') {
        this.selectedKataNameShiro = itemKata[0].KataNameRu
      }
      if (this.lng.toUpperCase() === 'UA') {
        this.selectedKataNameShiro = itemKata[0].KataNameUa
      }
      if (this.lng.toUpperCase() === 'EN') {
        this.selectedKataNameShiro = itemKata[0].KataNameEn
      }
    }
    this.selectedkataService.athIdShiro = this.fight?.white?.athId;
    this.selectedkataService.selectedKataShiro = this.selectedKataIdShiro;
    this.selectedkataService.selectedKataNameShiro = this.selectedKataNameShiro;
  }

  getTypeCategory(fight) {
    let result = ' ';
    if (fight?.details?.CategoryType == 0) { result = 'olympic (for elimination)' }
    if (fight?.details?.CategoryType == 1 && fight?.details?.CategoryBlockCount != 2) { result = 'circle (points only)' }
    if (fight?.details?.CategoryType == 1 && fight?.details?.CategoryBlockCount == 2) { result = 'circle (for all victories)' }
    if (fight?.details?.CategoryType == 2) { result = 'kata WKO (judge choice or your own)' }
    if (fight?.details?.CategoryType == 3) { result = 'kata WKB (points and flags)' }
  }
  isWinnerAka(fight) {
    return this.drawService.isWinnerAka(fight);
  }

  isWinnerShiro(fight) {
    return this.drawService.isWinnerShiro(fight);
  }

  isFightPostponed(fight) {
    return this.drawService.isFightPostponed(fight);
  }

  // checks if aka participant is desqualified in this fight
  isDesqualified(fight, participant) {
    let avg = fight.details.Avg;
    let isWkbFight = fight.details.CategoryType == this.typeWKB && fight.details.Level < 8;
    let hadPlace = this.drawService.fightAlreadyHadPlace(fight);
    let isDesqualified =
      participant && participant.FIO && isWkbFight && hadPlace && avg < 1;

    return isDesqualified;
  }

  getKataGroupName(group) {
    const nGrp = Number(group);
    const katagroup = this.katagroups.find((item) => item.KataGrpId == nGrp);

    if (katagroup) {
      if (this.lng === 'RU') {
        return katagroup.KataGrpNameRu
      }
      if (this.lng === 'UA') {
        return katagroup.KataGrpNameUa
      }
      if (this.lng === 'EN') {
        return katagroup.KataGrpNameEn
      }
    }
  }

  buildKataGroup(group) {
    this.kataMandat.splice(0, this.kataMandat.length);
    this.kataChoose.splice(0, this.kataChoose.length);
    let katagroup = this.katagroups.find((item) => item.KataGrpId == group);
    const space = " ";
    if (katagroup) {
      let arrkataid = katagroup.KataGrpMandatList.split(space);
      for (let el of arrkataid) {
        const kata = this.katas?.find((item) => item.KataId == Number(el));
        if (kata) {
          this.kataMandat.push(kata);
        }
      }
      arrkataid = katagroup.KataGrpChooseList.split(space);
      for (let el of arrkataid) {
        const kata = this.katas?.find((item) => item.KataId == Number(el));
        if (kata) {
          this.kataChoose.push(kata);
        }
      }
    }
  }

  getKataGroupMandat(group) {
    const nGrp = Number(group);
    const katagroup = this.katagroups.find((item) => item.KataGrpId == nGrp);
    const space = " ";
    let result = '';
    if (katagroup) {
      const arrkataid = katagroup.KataGrpMandatList.split(space);
      for (let el of arrkataid) {
        const kata = this.katas.find((item) => item.KataId == Number(el));
        if (kata) {
          if (this.lng === 'RU') {
            result = result + kata.KataNameRu + ',';
          }
          if (this.lng === 'UA') {
            result = result + kata.KataNameUa + ',';
          }
          if (this.lng === 'EN') {
            result = result + kata.KataNameEn + ',';
          }
        }
      }
    }
    return result;
  }

  getKataGroupChoose(group) {
    const nGrp = Number(group);
    const katagroup = this.katagroups.find((item) => item.KataGrpId == nGrp);
    const space = " ";
    let result = '';
    if (katagroup) {
      const arrkataid = katagroup.KataGrpChooseList.split(space);
      for (let el of arrkataid) {
        const kata = this.katas.find((item) => item.KataId == Number(el));
        if (kata) {
          if (this.lng === 'RU') {
            result = result + kata.KataNameRu + ',';
          }
          if (this.lng === 'UA') {
            result = result + kata.KataNameUa + ',';
          }
          if (this.lng === 'EN') {
            result = result + kata.KataNameEn + ',';
          }
        }
      }
    }
    return result;
  }

  getPassedMark(fight, participant) {
    // TODO: wrong mark after winner confirm
    // console.log("defining mark ")

    let isParticipantAka = fight?.red?.athId == participant?.athId;
    let isParticipantShiro = fight?.white?.athId == participant?.athId;
    let isWkbFight = fight.details.CategoryType == this.typeWKB && fight.details.Level < 8;
    let passedMark = <any>(
      (participant &&
        participant.FIO &&
        ((isParticipantAka && this.isWinnerAka(fight)) ||
          (isParticipantShiro && this.isWinnerShiro(fight))) &&
        (!isWkbFight ||
          (isWkbFight && !this.isDesqualified(fight, participant))))
    );

    if (!passedMark) {
      passedMark = this.isFightPostponed(fight) ? 'postponed' : false;
    }

    if (!passedMark) {
      passedMark = this.isDesqualified(fight, participant)
        ? 'desqualified'
        : false;
    }

    return passedMark;
  }

  isFightPassed(fight) {
    return fight.details.WinnerRed == '1' || fight.details.WinnerWhite == '1';
  }

  selectFight($event) {
    if (!this.selectable) {
      return;
    }

    if (typeof this.onSelectCallback == 'function') {
      this.onSelectCallback(this.fight);
    }

    this.fight.selected = !this.fight.selected;
  }

  toggleFullScreen() {
    document.documentElement.requestFullscreen();
    // if (!document.fullscreenElement) {
    //   document.documentElement.requestFullscreen();
    // } else if (document.exitFullscreen) {
    //   document.exitFullscreen();
    // }
  }

  // DRY
  // Move to common place fo rutils
  getType() {
    let type = '';

    if (
      this.fight.details.CategoryType == this.typeWKB &&
      this.fight.details.Level != 8 &&
      this.fight.details.Level != 12
    ) {
      type = 'wkb';
    } else if (this.fight.details.CategoryType == this.typeCircle) {
      type = 'circle';
    }

    return type;
  }

  getPoints(participantType) {
    let type = this.getType();
    let points = null;
    let details = this.fight.details;

    if (type == 'wkb') {
      points = {
        avg: details.Avg,
        refery1: details.Refery1,
        refery2: details.Refery2,
        refery3: details.Refery3,
        refery4: details.Refery4,
        refery5: details.Refery5,
        hadPlace: details.DuelIsPlace == 1,
      };
    } else if (type == 'circle') {
      let p /*refix*/ =
        participantType == 'aka' ? 'R' : participantType == 'shiro' ? 'W' : '';

      points = {
        chu1: details['Chu1' + p],
        chu2: details['Chu2' + p],
        chu3: details['Chu3' + p],
        vaz1: details['Vaz1' + p],
        vaz2: details['Vaz2' + p],
        ippon: details['Ippon' + p],
        hadPlace: details.DuelIsPlace == 1,
      };

      // console.log("points for", this.fight, points, p, 'Ippon' + p, details, details['Ippon' + p])
    }

    return points;
  }

  formatTime(time) {
    time = +time;

    // minutes = time /

    let timeDate = new Date();
    timeDate.setTime(time * 1000);

    let min = '' + timeDate.getMinutes();
    min = min.length == 1 ? '0' + min : min;

    let sec = '' + timeDate.getSeconds();
    sec = sec.length == 1 ? '0' + sec : sec;

    return min + ':' + sec;
  }

  // DRY
  // put in service
  eligibleToCancel = (fight) =>
    fight?.details?.DuelIsPlace == 1 &&
    (fight.details.WinnerRed == 1 || fight.details.WinnerWhite == 1);
  eligibleToPostpone = (fight) => fight.details.DuelIsPlace == 0;
  eligibleToUnpostpone = (fight) =>
    fight.details.DuelIsPlace == 1 &&
    fight.details.WinnerRed == 0 &&
    fight.details.WinnerWhite == 0;
}
