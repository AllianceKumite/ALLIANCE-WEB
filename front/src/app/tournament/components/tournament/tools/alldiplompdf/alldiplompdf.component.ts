import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, forkJoin } from 'rxjs';
import { HomeService } from 'src/app/shared/services/home.service';
import { CategoryService } from 'src/app/tournament/services/category.service';
import { TournamentService } from 'src/app/tournament/services/tournament.service';
import { environment } from 'src/environments/environment';
import { DrawService } from '../../draw/draw-service';
import htmlToPdfmake from 'html-to-pdfmake';
import pdfMake from 'pdfmake/build/pdfmake';
// import { map } from 'rxjs/operators';
import { jsPDF, jsPDFOptions } from 'jspdf';
import html2canvas from 'html2canvas';
import domToImage from 'dom-to-image';
// import jsPDF from 'jspdf';
import { FontPickerModule } from 'ngx-font-picker';
import { FONT_PICKER_CONFIG } from 'ngx-font-picker';
import { FontPickerConfigInterface } from 'ngx-font-picker';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { TatamiTitleComponent }       from '../../../tatami-title/tatami-title.component';

@Component({
  selector: 'app-alldiplompdf',
  templateUrl: './alldiplompdf.component.html',
  styleUrls: ['./alldiplompdf.component.css']
})

export class AlldiplompdfComponent {
  readonly logosDir: string = `${environment.logosDir}`;

  @ViewChild('fontSelector') fontSelector: NgSelectComponent;
  sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  selFontPart = 1;
  selSizePart = 42;
  italicPart: boolean = false;

  selFontName = 18;
  selSizeName = 32;
  italicName: boolean = false;

  selFontPlace = 1;
  selSizePlace = 46;
  italicPlace: boolean = false;

  selFontCat = 17;
  selSizeCat = 18;
  italicCat: boolean = false;

  selFontJob = 17;
  selSizeJob = 40;
  italicJob: boolean = false;

  title;
  showTitle: boolean = true;

  nameOfChampionship: string = '';
  champname: string = '';
  champcity: string = '';
  datefrom: string;
  dateto: string;
  dDatefrom: Date;
  dDateto: Date;
  orientation: number = 1;
  sizepage: number = 0;
  scale: number = 0.7;
  tournament: any;
  stamp_bytes: any;
  stamp: string;

  sign_bytes: any;
  sign: string;

  bcg_bytes: any;
  bcg: string;

  sizestamp = 120;
  sizesign = 120;
  headerline1: string = '';
  headerline2: string = '';
  headerline3: string = '';

  showChampName: boolean = true;
  showChampCity: boolean = true;
  showChampDate: boolean = true;

  categories: any[] = [];
  winnerscategory: any[] = [];

  subscription: Subscription;
  isShowSetup: boolean = true;
  direct1: string;
  direct2: string;
  direct1name: string;
  direct2name: string;
  lastName;
  firstName;

  data;
  participants;
  winners;
  selectedTime;
  subtimes;


  selectedTatami;

  tatamiCount;
  tatamies: any[] = [];

  selectedCategory: any;
  categoryId: string;
  categoryNum: number;
  participant: string;
  placeparticipant: string;

  participant1: string = '';
  participant2: string = '';
  participant3: string = '';
  participant4: string = '';

  place: string = '';
  place1: string = '';
  place2: string = '';
  place3: string = '';
  place4: string = '';

  fullFNCategory: string = '';
  percent: number;
  totaldiplom: number;
  pdfFile: jsPDF;

  font;

  imgWidth = 0;
  imgHeight = 0;
  jsOrientation = 'l';

  pageData;
  progress;
  textprogress = '';

  arrfonts: any[] = [
    { id: 1, name: 'dance_partner' },
    { id: 2, name: 'TT Chocolates' },
    { id: 3, name: 'Roboto-Regular' },
    { id: 4, name: 'Helvetica' },
    { id: 5, name: 'Arbatc' },
    { id: 6, name: 'Montserrat' },
    { id: 7, name: 'Chemyretro' },
    { id: 8, name: 'Spslcirclestwoc' },
    { id: 9, name: 'Lugaextra' },
    { id: 10, name: 'Englishscriptc' },
    { id: 11, name: 'Exo2Medium' },
    { id: 12, name: 'new_zelek' },
    { id: 13, name: 'lugashadow' },
    { id: 14, name: 'taurus-bold' },
    { id: 15, name: 'mon-amour' },
    { id: 16, name: 'europeext-normal' },
    { id: 17, name: '-apple-system' },
    { id: 18, name: 'Times New Roman' },
    { id: 19, name: 'helios-extra-black-bold' },
    { id: 20, name: 'helios-c-bold' },
    { id: 21, name: 'office-c-bold' },
    { id: 22, name: 'helga-c-bold' },
    { id: 23, name: 'europe-c-bold' },
  ];

  arrsize: any[] = [
    14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50,
    52, 64, 72, 84, 92, 106, 120
  ];

  constructor(
    private tournamentService: TournamentService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private homeService: HomeService,
    private translateService: TranslateService,
    private categoryService: CategoryService,
    private drawService: DrawService,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    this.subscription = this.homeService._champInfo.subscribe((champInfo) => {
      this.tournament = champInfo[1];

      this.datefrom = this.tournament?.champFrom;
      this.dateto = this.tournament?.champTo;
      this.dDatefrom = new Date(this.datefrom);
      this.dDateto = new Date(this.dateto);
      this.getChampInfo();
    });

    this.activeRoute.parent.params.subscribe((params) => {
      this.nameOfChampionship = params['name'];
      this.loadSubtimes();
    });

    await this.getCategories();
    for (let i = 0; i < this.categories.length; i++) {
      let num: string = this.categories[i].name;

      // this.data = await this.getData(this.categories[i].id);
      this.data = await this.getData(this.categories[i].name.id);
      this.data.blocks = this.splitByBlocksAndLevels(
        this.data.fights,
        this.data.category
      );

      this.participants = await this.drawService.getFightsParticipants(
        this.data.fights
      );

      this.winnerscategory.push(this.participants);
    }

    await this.tournamentService
    .getAllTatami(this.nameOfChampionship)
    .subscribe((response) => this.setTatamiCount(response));

    this.translateService.onLangChange.subscribe((event) => {
      this.getChampInfo();
      this.loadSubtimes();
      this.initTatamies();
    });
  }

  setTatamiCount(response){
    this.tatamiCount = response['tatamisCount']; 
    // console.log(this.tatamiCount);
    
    this.initTatamies()
  }

  initTatamies() {
    this.tatamies = [
      {
        id: 0,
        name: this.translateService.instant('general.allTatamis'),
      },
    ];

    for (let i = 1; i <= this.tatamiCount; i++) {
      this.tatamies.push({
        id: i,
        name: TatamiTitleComponent.getTitle(
          this.translateService.instant('navbar.tatami'),
          0,
          i
        ),
      });
    }

    // this.tatamisInit = this.tatamis;

    // if (this.isMobileView) {
    //   this.tatamis = this.tatamis.filter((x) => x.id !== 0);
    // }
  }

  async loadSubtimes() {
    this.subtimes = await this.tournamentService.getSubtimes(this.nameOfChampionship).toPromise();
    let all = '';
    this.translateService.get("manage.alltimes").subscribe(
      txt => all = txt
    )

    this.subtimes.push(all);
    this.selectedTime = null;
    if (this.subtimes.length > 0) {
    }

    if (this.subtimes.length == 1) {

    }

  }

  splitByBlocksAndLevels(fights, category) {
    let blocks = null;

    if (fights && fights.length > 0) {
      blocks = fights?.reduce((restructuredFights, fight, index) => {
        let levePair = fight.details['LevePair'];
        let blockNum = fight.details['BlockNum'];

        if (!restructuredFights[blockNum]) {
          restructuredFights[blockNum] = [];
          restructuredFights.amount =
            typeof restructuredFights.amount == 'undefined'
              ? 1
              : restructuredFights.amount + 1;
        }

        if (!restructuredFights[blockNum][levePair]) {
          restructuredFights[blockNum][levePair] = [];
        }

        if (
          // If fight is final or fight for 3-d place then change the order of it in array
          // (for printing order convenience)
          ((this.isOlympicCategory(category) || this.isWkbCategory(category)) &&
            (fight.details.Duel1Place == '1' ||
              fight.details.Duel3Place == '1' ||
              fight.details.Duel5Place == '1')) ||
          (this.isCircleCategory(category) &&
            (fight.details.Level == 12 || fight.details.Level == 8))
        ) {
          // 8 7 6 5
          restructuredFights[blockNum][levePair].unshift(fight);
          // restructuredFights[levePair].push(fight);
        } else {
          // 1 2 3 4
          restructuredFights[blockNum][levePair].push(fight);
        }

        return restructuredFights;
      }, []);
    }

    return blocks;
  }

  isOlympicCategory(category) {
    return category && +category.CategoryType == 0;
  }

  isCircleCategory(category) {
    return category && +category.CategoryType == 1;
  }

  isWkbCategory(category) {
    return category && +category.CategoryType == 3;
  }

  async getCategories(): Promise<Array<any>> {
    let result: any;
    return new Promise((resolve, reject) => {
      this.homeService
        .getCategories({ title: this.nameOfChampionship })
        .subscribe((response: any[]) => {         
          this.initCategories(response);
          resolve(result);
        });
    });
  }

  async getData(numcategory: string): Promise<Array<any>> {
    let result: any;

    return new Promise((resolve, reject) => {
      this.categoryService
        .getDrawData(this.nameOfChampionship, numcategory)
        .subscribe((data) => {
          result = data;
          resolve(result);
        });
    });
  }

  async getWinners(participantsByBlocks, category) {
    let totalParticipantsCount = await this.getTotalParticipantsCount(
      participantsByBlocks
    );
    // Category3Place is taken to account to decide should be shown 2 third places or 1 third place
    let isThirdPlaceFight = category.Category3Place == 1;

    let winnerIds =
      totalParticipantsCount == 2
        ? [category.idxAth1Place, category.idxAth2Place]
        : totalParticipantsCount == 3
          ? [category.idxAth1Place, category.idxAth2Place, category.idxAth3Place]
          : totalParticipantsCount > 3 && isThirdPlaceFight
            ? [category.idxAth1Place, category.idxAth2Place, category.idxAth3Place]
            : totalParticipantsCount > 3 && !isThirdPlaceFight
              ? [
                category.idxAth1Place,
                category.idxAth2Place,
                category.idxAth3Place,
                category.idxAth4Place,
              ]
              : [];

    return winnerIds.map((id, index) => {
      let winner = null;

      participantsByBlocks.every((participants) => {
        winner = participants.filter((p) => p && p.athId == id);

        if (winner && winner.length > 0) {
          winner = JSON.parse(JSON.stringify(winner[0]));
        } else {
          winner = {};
        }

        winner.place = index < 3 ? index + 1 : 3;

        return !winner.athId || winner.athId == -1;
      });

      return winner;
    });
  }

  async getTotalParticipantsCount(participantsByBlocks) {
    return participantsByBlocks.reduce(
      (reduced, participants) =>
        reduced +
        participants.filter((p) => p && p.athId && p.athId != -1).length,
      0
    );
  }

  getChampInfo() {
    let lng = localStorage.getItem('lng');
    if (lng === 'ru') {
      this.champname = this.tournament?.champNameRu;
      this.champcity = this.tournament?.champCityRu;
    }
    if (lng === 'ua') {
      this.champname = this.tournament?.champNameUa;
      this.champcity = this.tournament?.champCityUa;
    }
    if (lng === 'en') {
      this.champname = this.tournament?.champNameEn;
      this.champcity = this.tournament?.champCityEn;
    }
    this.place = this.getTextPlace(1);
  }

  getTextPlace(num: number): string {
    let lng = localStorage.getItem('lng');
    let text: string = '';
    let place: string = '';
    let result: string = '';
    switch (num) {
      case 1:
        text = 'I';
        break;
      case 2:
        text = 'II';
        break;
      case 3:
        text = 'III';
        break;
      case 4:
        text = 'III';
        break;
    }

    if (lng === 'ru') {
      place = ` место`;
    }
    if (lng === 'ua') {
      place = ` місце`;
    }
    if (lng === 'en') {
      place = ` place`;
    }
    result = `${text}` + place.toLowerCase();
    return result;
  }

  initCategories(response) {
    if (response) {
      let vals = Object.values(response);

      this.categories = Object.keys(response).map((w, index) => {
        return { id: w, name: vals[index] };
      });

    }
  }

  async onLoadStamp(event) {
    let file = event.target.files[0];
    let imgUrl = (await this.getBase64(file)) as any;
    this.stamp_bytes = imgUrl; //.replace(/^data:(.*,)?/, '');
    this.stamp = event.target.files[0]['name'];
  }

  async onLoadSign(event) {
    let file = event.target.files[0];
    let imgUrl = (await this.getBase64(file)) as any;
    this.sign_bytes = imgUrl; //.replace(/^data:(.*,)?/, '');
    this.sign = event.target.files[0]['name'];
  }

  private getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  onDelSign() {
    this.sign_bytes = '';
    this.sign = '';
  }

  onDelStamp() {
    this.stamp_bytes = '';
    this.stamp = '';
  }

  getsize() {
    return `${this.sizestamp}px`;
  }

  getsizeSign() {
    return `${this.sizesign}px`;
  }

  async onRowClick(category) {
    this.selectedCategory = category;

    this.categoryId = category?.name.id;

    this.categoryId = this.selectedCategory?.name.id;

    this.categoryNum = category?.name.id;

    let winnercategory = this.winnerscategory[this.categoryNum - 1];
    if (winnercategory) {
      this.participant = winnercategory[0][0].FIO;
      this.participant = this.getFIO(this.participant);
    }
    this.place = this.getTextPlace(1);
  }

  setupPage() {
    if (this.orientation == 0) {
      this.jsOrientation = 'p';
      if (this.sizepage == 0) {
        this.imgWidth = 8.3;
        this.imgHeight = 11.7;
      } else {
        this.imgWidth = 11.7;
        this.imgHeight = 16.5;
      }
    } else {
      this.jsOrientation = 'l';
      if (this.sizepage == 0) {
        this.imgWidth = 11.7;
        this.imgHeight = 8.3;
      } else {
        this.imgWidth = 16.5;
        this.imgHeight = 11.7;
      }
    }
  }

  async addpage(isAddPage) {
    await html2canvas(this.pageData).then((canvas: any) => {
      let pageData = canvas.toDataURL('image/jpeg', 1.0);
      if (isAddPage) {
        this.pdfFile.addPage();
      }
      this.pdfFile.addImage(
        pageData,
        'JPEG',
        0,
        0,
        this.imgWidth,
        this.imgHeight
      );
    });
  }

  async drawAll() {
    this.pageData = document.getElementById('box-diplom');
    let preloader = document.getElementById('preloader');
    preloader.style.display = 'block';
    this.fullFNCategory = `all-diplom.pdf`;

    this.fullFNCategory = `diplom-${this.tournament.title}.pdf`;
    if(this.selectedTime){
      this.fullFNCategory = `diplom-${this.tournament.title}-${this.selectedTime}.pdf`;
    }

    if(this.selectedTatami){
      this.fullFNCategory = `diplom-${this.tournament.title}-${this.selectedTatami}.pdf`;
    }

    if(this.selectedTatami && this.selectedTime){
      this.fullFNCategory = `diplom-${this.tournament.title}-${this.selectedTime}-${this.selectedTatami}.pdf`;
    }

    // console.log(this.fullFNCategory);

    // const data = document.getElementById('box-diplom');
    this.setupPage();
    if (this.orientation == 0) {
      this.pdfFile = new jsPDF(
        'p',
        'in',
        [this.imgWidth, this.imgHeight],
        true
      );
    } else {
      this.pdfFile = new jsPDF(
        'l',
        'in',
        [this.imgWidth, this.imgHeight],
        true
      );
    }

    let addPage = false;
    let fName;

    this.setupPage();
    if (this.orientation == 0) {
      this.pdfFile = new jsPDF(
        'p',
        'in',
        [this.imgWidth, this.imgHeight],
        true
      );
    } else {
      this.pdfFile = new jsPDF(
        'l',
        'in',
        [this.imgWidth, this.imgHeight],
        true
      );
    }

    for (let i = 0; i < this.categories.length; i++) {
      let category = this.categories[i];
      let lOk = true;

      if(this.selectedTime){
        let nTime = this.selectedTime;
        lOk = typeof nTime == 'string';
        // if(!lOk){
        //   lOk = Number(category.name.time) == Number(this.selectedTime);
        // }
        lOk = Number(category.name.time) == Number(this.selectedTime);
        if (!lOk) {continue};
      }
      
      if(this.selectedTatami){
        let nTatami = this.selectedTatami;
        lOk = typeof nTatami == 'string';
        // if(!lOk){
        lOk = Number(category.name.tatami) == Number(this.selectedTatami);
        if (!lOk) {continue};
        // }
      }

      // if (!lOk) {continue};

      await this.onRowClick(category);

      // this.setupPage();
      // if (this.orientation == 0) {
      //   this.pdfFile = new jsPDF(
      //     'p',
      //     'in',
      //     [this.imgWidth, this.imgHeight],
      //     true
      //   );
      // } else {
      //   this.pdfFile = new jsPDF(
      //     'l',
      //     'in',
      //     [this.imgWidth, this.imgHeight],
      //     true
      //   );
      // }

      // let addPage = false;

      let winnercategory = this.winnerscategory[i];
      this.textprogress = `Build: ${i + 1} of ${this.categories.length}`;
      this.translateService
        .get('champ.categories.' + category?.id)
        .subscribe((res: string) => {
          fName = res;
        });
      // this.fullFNCategory = `diplom-${this.tournament.title}-${fName}.pdf`;

      // this.fullFNCategory = `diplom-${this.tournament.title}-${fName}.pdf`;

      for (let k = 0; k < winnercategory.length; k++) {
        for (let j = 0; j < winnercategory[k].length; j++) {

          if (this.isFirstCharNotAlpha(winnercategory[k][j].FIO)) {
            continue
          }

          // this.participant = fio;

          this.participant = winnercategory[k][j].FIO;
          this.participant = this.getFIO(this.participant);
          // if (this.participant.length < 4) {
          //   continue
          // }

          this.cdr.detectChanges();
          if (this.participant) {
            await this.addpage(addPage);
            addPage = true;
          }
        }
      }
      // this.pdfFile.save(this.fullFNCategory);

    }

    this.pdfFile.save(this.fullFNCategory);
    this.textprogress = "Complete";
    preloader.style.display = 'none';
  }

  isCirilic(data) {
    const regExp = /^[?!,.а-яА-ЯёЁіІїЇ0-9\s]+$/;
    let result = regExp.test(data);
    // console.log(data, result);
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
      //   // this.firstName = splitted?.length > 2 ? splitted[1] : '';  
      // }
    }
  }

  getFIO(FIO) {
    this.parseFio(FIO);
    return this.firstName + ' ' + this.lastName;
  }


  async drawcategory(category) {
    let catNum = category?.id;

    this.pageData = document.getElementById('box-diplom');
    let fName;
    this.translateService
      .get('champ.categories.' + category?.id)
      .subscribe((res: string) => {
        fName = res;
      });
    this.fullFNCategory = `diplom-${this.tournament.title}-${fName}.pdf`;

    this.setupPage();

    if (this.orientation == 0) {
      this.pdfFile = new jsPDF(
        'p',
        'in',
        [this.imgWidth, this.imgHeight],
        true
      );
    } else {
      this.pdfFile = new jsPDF(
        'l',
        'in',
        [this.imgWidth, this.imgHeight],
        true
      );
    }

    let winnercategory = this.winnerscategory[catNum - 1];
    let cnt = 0;
    for (let j = 0; j < winnercategory.length; j++) {

      // console.log(winnercategory[j].length);
      for (let i = 0; i < winnercategory[j].length; i++) {
        let fio = winnercategory[j][i].FIO;

        // console.log(fio);


        if (this.isFirstCharNotAlpha(fio[0])) {
          continue
        }

        this.participant = fio;
        this.participant = this.getFIO(this.participant);
        // if (this.participant.length < 4) {
        //   continue
        // }


        this.cdr.detectChanges();

        if (this.participant) {
          await this.addpage(cnt != 0);
        }
        cnt++;
      }
    }

    this.pdfFile.save(this.fullFNCategory);
  }

  isFirstCharNotAlpha(symbol): boolean {
    let result = false;
    if (/[a-zа-яё]/i.test(symbol)) {
      result = false;
    } else {
      result = true;
    }
    return result;
  }

  addPagePlace() { }

  async onBuildPDF(fname: string) {
    const data = document.getElementById('box-diplom');
    let fName: string = '';
    let fullName: string = '';
    this.translateService
      .get('champ.categories.' + this.categoryId)
      .subscribe((res: string) => {
        fName = res;
      });
    fullName = `${this.tournament.title}-${fName}.pdf`;

    html2canvas(data).then((canvas: any) => {
      var imgWidth = 11.7;
      var imgHeight = 8.3;
      var pageData = canvas.toDataURL('image/jpeg', 1.0);
      var pdf = new jsPDF('l', 'in', [imgWidth, imgHeight], true);
      pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(fullName);
    });
  }

  public downloadAsPdf(): void {
    const data = document.getElementById('box-diplom');

    const width = data.clientWidth;
    const height = data.clientHeight + 40;
    let orientation = '';
    let imageUnit = 'pt';
    const jsPdfOptions = {
      orientation: orientation,
      unit: imageUnit,
      format: [width + 50, height + 220],
    };

    if (width > height) {
      orientation = 'l';
    } else {
      orientation = 'p';
    }
    domToImage.domToImage
      .toPng(this.data, {
        width: width,
        height: height,
      })
      .then((result) => {
        const pdf = new jsPDF('l', 'pt', 'a4');
        pdf.addImage(result, 'PNG', 25, 185, width, height);
        pdf.save('1.pdf');
      })
      .catch((error) => { });
  }

  onChangeShowName() {
    this.showChampName = !this.showChampName;
  }

  onChangeShowTitle() {
    this.showTitle = !this.showTitle;
  }

  onChangeShowCity() {
    this.showChampCity = !this.showChampCity;
  }

  onChangeShowDate() {
    this.showChampDate = !this.showChampDate;
  }

  async onLoadBcg(event) {
    let file = event.target.files[0];
    let imgUrl = (await this.getBase64(file)) as any;
    this.bcg_bytes = imgUrl; //.replace(/^data:(.*,)?/, '');
    this.bcg = event.target.files[0]['name'];
  }

  fontsize() {
    let block = document.getElementById('participant');
    let w = block.offsetWidth;
    block.style.fontSize = w / 13 + 'px';
  }

  changeFontPart() {
    let el = document.getElementById('participant');
    let idx: number = Number(this.selFontPart) - 1;
    el.style.fontFamily = this.arrfonts[idx].name;
  }

  changeSizePart() {
    let el = document.getElementById('participant');
    let idx: number = Number(this.selSizePart);
    el.style.fontSize = this.selSizePart + 'px';
  }

  onPartItalic() {
    this.italicPart = !this.italicPart;
    let el = document.getElementById('participant');
    el.style.fontStyle = 'normal';
    if (this.italicPart) {
      el.style.fontStyle = 'italic';
    }
  }

  onClrPart(event) {
    let el = document.getElementById('participant');
    let val = event.target.value;
    el.style.color = val;
  }

  changeFontName() {
    let el = document.getElementById('rchampname');
    let idx: number = Number(this.selFontName) - 1;
    el.style.fontFamily = this.arrfonts[idx].name;
  }

  changeSizeName() {
    let el = document.getElementById('rchampname');
    let idx: number = Number(this.selSizeName);
    el.style.fontSize = this.selSizeName + 'px';
  }

  onNameItalic() {
    this.italicPart = !this.italicPart;
    let el = document.getElementById('rchampname');
    el.style.fontStyle = 'normal';
    if (this.italicPart) {
      el.style.fontStyle = 'italic';
    }
  }

  onClrChampname(event) {
    let el = document.getElementById('rchampname');
    let val = event.target.value;
    el.style.color = val;
  }

  changeFontPlace() {
    let el = document.getElementById('rplace');
    let idx: number = Number(this.selFontPlace) - 1;
    el.style.fontFamily = this.arrfonts[idx].name;
  }

  changeSizePlace() {
    let el = document.getElementById('rplace');
    let idx: number = Number(this.selSizePlace) - 1;
    el.style.fontSize = this.selSizePlace + 'px';
  }

  onPlaceItalic() {
    this.italicPlace = !this.italicPlace;
    let el = document.getElementById('rplace');
    el.style.fontStyle = 'normal';
    if (this.italicPlace) {
      el.style.fontStyle = 'italic';
    }
  }

  onClrPlace(event) {
    let el = document.getElementById('rplace');
    let val = event.target.value;
    el.style.color = val;
  }

  changeFontCat() {
    let el = document.getElementById('rcat');
    let idx: number = Number(this.selFontCat) - 1;
    el.style.fontFamily = this.arrfonts[idx].name;
  }

  changeSizeCat() {
    let el = document.getElementById('rcat');
    let idx: number = Number(this.selSizeCat) - 1;
    el.style.fontSize = this.selSizeCat + 'px';
  }

  onCatItalic() {
    this.italicCat = !this.italicCat;
    let el = document.getElementById('rcat');
    el.style.fontStyle = 'normal';
    if (this.italicCat) {
      el.style.fontStyle = 'italic';
    }
  }

  onClrCat(event) {
    let el = document.getElementById('rcat');
    let val = event.target.value;
    el.style.color = val;
  }

  changeFontJob() {
    let el = document.getElementById('rjob');
    let idx: number = Number(this.selFontJob) - 1;
    el.style.fontFamily = this.arrfonts[idx].name;
    el = document.getElementById('rdate');
    el.style.fontFamily = this.arrfonts[idx].name;
  }

  changeSizeJob() {
    let el = document.getElementById('rjob');
    let idx: number = Number(this.selSizeJob) - 1;
    el.style.fontSize = this.selSizeJob + 'px';
    el = document.getElementById('rdate');
    el.style.fontSize = this.selSizeJob + 'px';
  }

  onJobItalic() {
    this.italicJob = !this.italicJob;
    let el = document.getElementById('rjob');
    el.style.fontStyle = 'normal';
    if (this.italicJob) {
      el.style.fontStyle = 'italic';
    }

    el = document.getElementById('rdate');
    el.style.fontStyle = 'normal';
    if (this.italicJob) {
      el.style.fontStyle = 'italic';
    }
  }

  onClrJob(event) {
    let el = document.getElementById('rjob');
    let val = event.target.value;
    el.style.color = val;
    el = document.getElementById('rdate');
    el.style.color = val;
  }

  changeOrientation(orientation) {
    let el = document.getElementById('bcgorientation');
    if (orientation == 0) {
      el.style.height = '100%';
    } else {
      el.style.width = '100%';
    }
  }
}
