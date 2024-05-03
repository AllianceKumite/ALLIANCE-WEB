import { ChangeDetectorRef, Component, OnInit, Input, ViewChild, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser'
import { environment } from 'src/environments/environment';
import { ConfirmService } from './../../services/confirm.service';
import { TournamentService } from './../../services/tournament.service';
import { KataGroup, Kata } from '../../models/katagroup.model'
import { TranslateService } from '@ngx-translate/core';
import { SelectedkataService } from '../../services/selectedkata.service';
import { OnlineService } from '../../services/online.service';
import { OrderService } from '../../services/order.service';
// import { OnlineComponent } from '../tournament/online/online.component';

@Component({
  selector: 'participant',
  templateUrl: './participant.component.html',
  styleUrls: ['./participant.component.css'],
})
export class ParticipantComponent implements OnInit {

  // @Output() onKataChange = new EventEmitter()

  @Input()
  info;

  @Input()
  idxMiddle;

  @Input()
  idx;


  @Input()
  kataMandat;

  @Input()
  kataChoose;

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

  // Use some clever state managements tools here
  @Input()
  categoryFilter;

  @Input()
  details;

  @Input()
  points;

  title: string;

  @Input()
  drawPlace: boolean = true;

  @Input() marks: any;

  @Input() addWindow: Function;

  lastName: string = '';
  firstName: string = '';
  @Input()
  katagroup;

  selectedKataMandat;
  selectedKataChoose;
  groupkata: number = -1;

  @Input()
  chooselevel;

  isError;
  show='show';

  donekata: any[] = [
    { level: 1, kataid: -1 },
    { level: 2, kataid: -1 },
    { level: 3, kataid: -1 },
    { level: 4, kataid: -1 },
    { level: 5, kataid: -1 },
    { level: 6, kataid: -1 },
    { level: 7, kataid: -1 },
    { level: 8, kataid: -1 },
    { level: 12, kataid: -1 }
  ];

  level;

  cntWinner = 0;

  // donekata : [];

  lng: string;

  @Output() selectedKata       = new EventEmitter<number>();
  @Output() selectedKataRefery = new EventEmitter<number>();
  @Output() updateInfoLevel    = new EventEmitter<number>();

  readonly logosDir: string = `${environment.logosDir}`;
  readonly photoDir: string = `${environment.photoDir}`;

  constructor(
    private activeRoute: ActivatedRoute,
    private tournamentService: TournamentService,
    private translateService: TranslateService,
    private selectedkataService: SelectedkataService,
    private cdr: ChangeDetectorRef,
    private сonfirmService: ConfirmService,
    private onlineService : OnlineService,
    private orderService: OrderService,
    // private onlineComponent : OnlineComponent
  ) {
    this.tournamentService = tournamentService;
  }

  ngOnInit(): void {
    this.activeRoute.parent?.params.subscribe((params) => {
      this.title = params['name'];
    });
    this.selectedKataMandat = null;
    this.selectedKataChoose = null;

    this.parseFio(this?.info?.FIO);

  }

  async ngOnChanges(changes: SimpleChanges) {
    this.selectedKataMandat = null;
    this.selectedKataChoose = null;
    this.onSelectChange(0);
    this.onSelectChange(1);
    this.lng = localStorage.getItem('lng').toUpperCase();
    this.translateService.onLangChange.subscribe((event) => {
      this.lng = localStorage.getItem('lng').toUpperCase();
      this.onSelectChange(0);
      this.onSelectChange(1);
    });

    // await this.buildDoneKata();
    this.groupkata = this.katagroup;

    this.level = this.details?.Level;

    if (changes?.info?.currentValue?.FIO) {
      this.parseFio(changes?.info?.currentValue?.FIO);
    }
    if (changes?.info?.currentValue?.Photo) {
      this.parsePhoto(changes?.info?.currentValue?.Photo);
    }
  }

  isDisabledChoose(){
    return this.level < this.chooselevel;
  }

  isDisabledMandat(){
    return this.level >= this.chooselevel;
  }

  async buildDoneKata() {
    this.donekata[0].kataid = this.info?.lvl1;
    this.donekata[1].kataid = this.info?.lvl2;
    this.donekata[2].kataid = this.info?.lvl3;
    this.donekata[3].kataid = this.info?.lvl4;
    this.donekata[4].kataid = this.info?.lvl5;
    this.donekata[5].kataid = this.info?.lvl6;
    this.donekata[6].kataid = this.info?.lvl7;
    this.donekata[7].kataid = this.info?.lvl12;
  }

  getDoneKataName() {
    let result = '';
    if (this.groupkata > 0) {
      for (let elem of this.donekata) {
        let level = elem.level;
        let str = this.getkataName(level);
        let name = ''
        this.translateService.get("level." + level).subscribe(
          txt => name = txt
        )
        if (str == '—') { str = '' }
        if (str.length > 0) {
          result = result + name + ':' + str + '; '
        }
      }
    }
    return result;
  }

  getkataName(katalevel) {
    let result = '';
    let defValue = '—';
    let kataid = -1;
    if (this.groupkata > 0) {
      switch (katalevel) {
        case 1:
          kataid = this.info?.lvl1;
          break;
        case 2:
          kataid = this.info?.lvl2;
          break;
        case 3:
          kataid = this.info?.lvl3;
          break;
        case 4:
          kataid = this.info?.lvl4;
          break;
        case 5:
          kataid = this.info?.lvl5;
          break;
        case 6:
          kataid = this.info?.lvl6;
          break;
        case 7:
          kataid = this.info?.lvl7;
          break;
        case 8:
          kataid = this.info?.lvl8;
          break;
        case 12:
          kataid = this.info?.lvl12;
          break;
      }

      result = this.getItemNameMandat(kataid);
      if (result.length == 0) {
        result = this.getItemNameChoose(kataid);
      }

      if (result.length == 0) {
        result = defValue;
      }
    }
    return result;
  }

  getItemNameChoose(kataId) {
    let itemKata: Kata[];
    itemKata = this.kataChoose?.filter((item) => item.KataId == Number(kataId));
    let result = '';
    if (itemKata && itemKata.length > 0) {
      if (this.lng.toUpperCase() === 'RU') {
        result = itemKata[0].KataNameRu;
      }
      if (this.lng.toUpperCase() === 'UA') {
        result = itemKata[0].KataNameUa
      }
      if (this.lng.toUpperCase() === 'EN') {
        result = itemKata[0].KataNameEn
      }
    }
    return result;
  }

  getItemNameMandat(kataId) {
    let itemKata: Kata[];
    itemKata = this.kataMandat?.filter((item) => item.KataId == Number(kataId));
    let result = '';
    if (itemKata && itemKata.length > 0) {
      if (this.lng.toUpperCase() === 'RU') {
        result = itemKata[0].KataNameRu;
      }
      if (this.lng.toUpperCase() === 'UA') {
        result = itemKata[0].KataNameUa
      }
      if (this.lng.toUpperCase() === 'EN') {
        result = itemKata[0].KataNameEn
      }
    }
    return result;
  }

  isCirilic(data){
    const regExp = /^[?!,.а-яА-ЯёЁіІїЇєЄ'0-9\s]+$/;   
    let result = regExp.test(data);
    return result;
  }

  parseFio(FIO) {
    if (typeof FIO?.split == 'function') {
      
      let splitted = FIO?.split(' ');
      this.lastName = splitted?.length > 0 ? splitted[1] : '';
      this.firstName = splitted?.length > 1 ? splitted[0] : '';  

      // if(this.isCirilic(splitted[0])){
      //   this.lastName = splitted?.length > 0 ? splitted[1] : '';
      //   this.firstName = splitted?.length > 1 ? splitted[0] : '';  
      // } 
      // else{
      //   this.lastName = splitted?.length > 0 ? splitted[0] : '';
      //   let fname1 = splitted?.length > 1 ? splitted[1] : '';
      //   let fname2 = splitted?.length > 2 ? splitted[2] : '';
      //   let fname3 = splitted?.length > 3 ? splitted[3] : '';
 
      //   this.firstName = fname1 + ' ' + fname2 + ' ' + fname3;  
      // }
    }
  }

  getFIO(FIO){
    this.parseFio(FIO);
    return this.firstName + ' ' + this.lastName;
  }

  parsePhoto(Photo) {
    let photo = this.photoDir + '/' + 'default-photo.svg';
    if (typeof Photo?.split == 'function') {
      // if (Photo?.length > 0) {
      let splitted = Photo?.split('/');
      if (splitted?.length > 0) {
        photo = this.photoDir + '/' + splitted[splitted?.length - 1];
      }
    }
    this.info.Photo = photo;
  }

  onSelectReferyKata() {
    let minValue = 0;
    let maxValue = this.kataMandat.length - 1;
    let randomValue = Math.floor(Math.random() * (maxValue - minValue + 1) + minValue);
    this.selectedKataMandat = this.kataMandat[randomValue].KataId;
    this.onSelectChangeRefery();
  }

  onSelectChange(type) {
    this.isError = false;
    if (type == 0) { 
      this.selectedKataChoose = null;
      this.selectedKata.emit(this.selectedKataMandat) 
    }
    else { 
      this.selectedKataMandat = null;
      if(this.checkSelectedKata()){
        this.selectedKataChoose = null;
        this.isError = true;
      }
     
      this.selectedKata.emit(this.selectedKataChoose) 
    }
  }

  onSelectChangeRefery() {
    this.selectedKataChoose = null;
    this.selectedKataRefery.emit(this.selectedKataMandat) 
  }

  onSelectChangeYour(){
    this.isError = false;
    this.selectedKataMandat = null;
    if(this.checkSelectedKata()){
      this.selectedKataChoose = null;
      this.isError = true;
    }   
    this.selectedKata.emit(this.selectedKataChoose) 
  }

  checkSelectedKata() : boolean{
    if(this.selectedKataChoose == null){
      return false;
    }
    let result = 
    Number(this.info?.lvl1) == Number(this.selectedKataChoose) || 
    Number(this.info?.lvl2) == Number(this.selectedKataChoose) ||
    Number(this.info?.lvl3) == Number(this.selectedKataChoose) ||
    Number(this.info?.lvl4) == Number(this.selectedKataChoose) ||
    Number(this.info?.lvl5) == Number(this.selectedKataChoose) ||
    Number(this.info?.lvl6) == Number(this.selectedKataChoose) ||
    Number(this.info?.lvl7) == Number(this.selectedKataChoose) ||
    Number(this.info?.lvl8) == Number(this.selectedKataChoose) ||
    Number(this.info?.lvl12) == Number(this.selectedKataChoose);
   
    return result;
  }

  isParticipantUndefined() {
    // Rewrite it to more safe
    let isUndefined = !this.isParticipantDefined();
    // !this.info || this.info.FIO && (
    //     this.info.FIO == '' ||
    //     this.info.FIO.indexOf(' #') != -1
    // )

    return isUndefined;
  }

  isParticipantDefined() {
    // let participantDefined = !this.isParticipantUndefined();
    let participantDefined = this.info?.athId > 0;

    return participantDefined;
  }

  get4DigitOrdNum() {
    let ordNum =
      this.info && this.info.OrdNum
        ? this.info.OrdNum.toString().padStart(4, '0')
        : '';

    return ordNum;
  }

  // ================ Manage fights =================== //

  onWinner = (points) => {

    this.tournamentService
      .setFightWinner({
        title: this.title,
        fight: this.fight,
        winner: this.akaShiroType,
        points: points,
        categoryFilter: this.categoryFilter,
        kataIdAka: this.selectedkataService.selectedKataAka,
        kataIdShiro: this.selectedkataService.selectedKataShiro,
        level: this.level
      }
      )
      .subscribe((response) => {
        this.сonfirmService.updateFightsAfterWinnerSet(
          response,
          this.akaShiroType,
          points
        );
        // this.loadTatamiesData();
      })
      ;
  };

  // public loadTatamiesData():void{
  //   // this.cntWinner= this.cntWinner + 1;   
  //   this.orderService.sendClickEvent(Math.random());
  // }


  ff(number, presision) {
    return (+number).toFixed(presision);
  }

  getFormattedPoints(points) {
    let formatted = '';

    if (typeof points?.refery1 != 'undefined') {
      formatted =
        this.ff(points.avg, 2) +
        ' (' +
        this.ff(this.info.CountBallKata, 2) +
        ') ' +
        this.ff(points.refery1, 2) +
        ' | ' +
        this.ff(points.refery2, 2) +
        ' | ' +
        this.ff(points.refery3, 2) +
        ' | ' +
        this.ff(points.refery4, 2) +
        ' | ' +
        this.ff(points.refery5, 2);
    } else if (this.passed == true) {
      formatted =
        ((points.vaz1 == '1' && points.vaz2 == '1') || points.ippon == '1'
          ? 'I'
          : (points.vaz1 == '0' && points.vaz2 == '1') ||
            (points.vaz1 == '1' && points.vaz2 == '0')
            ? 'V'
            : 'R') +
        ' / ' +
        this.ff(this.info.CountBall, 0);
    } else if (this.passed == false) {
      formatted =
        (points.hadPlace ? 'L' : 'N') + ' / ' + this.ff(this.info.CountBall, 0);
    }

    return formatted;
  }

  getKey = (unparsed) =>
    unparsed > 0 ? 'winner' : unparsed < 0 ? 'looser' : 'none';

  getValue = (unparsed) => (unparsed == 0 ? '' : ' #' + Math.abs(unparsed));
}
