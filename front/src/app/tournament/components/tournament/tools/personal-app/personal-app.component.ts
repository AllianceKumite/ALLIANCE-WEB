import { Component, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, IsActiveMatchOptions } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HomeService } from '../../../../../shared/services/home.service'
import { TournamentService } from '../../../../services/tournament.service';
import { Participant } from 'src/app/tournament/models/participant.model';
// import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-personal-app',
  templateUrl: './personal-app.component.html',
  styleUrls: ['./personal-app.component.css']
})
export class PersonalAppComponent {
  // @ViewChild('countrySelector') countrySelector: NgSelectComponent;
  // @ViewChild('clubSelector') clubSelector: NgSelectComponent;
  // @ViewChild('coachSelector') coachSelector: NgSelectComponent;

  subscription: Subscription;
  tournament: any;

  champName: string;
  programm: string;
  agecategory: string;
  champInfo: string;
  command: string;
  citychamp: string;
  datechamp;
  coachname: string = 'team leader';
  addrcoach: string = 'adress team';
  champType;
  countries: any[] = [];
  regions: any[] = [];
  champclubs: any[] = [];
  clubs: any[] = [];
  coaches: any[] = [];
  categories: any[] = [];

  filter: any = {
    title: null,
    category: null
  }

  participants: Participant[] = [];
  customParticipants: Participant[] = [];

  athletePhotosDir: string = `${environment.mediaDir}/athletes_photo`;
  defaultPhotosDir: string = environment.photoDir;
  readonly logosDir: string = `${environment.logosDir}`;

  selectedCountry;
  selectedClub;
  selectedCoach;
  selectedRegion;
  // selectedRegionId;

  country;
  club;
  coach;
  region: string;
  helppage;
  lng;

  constructor(
    private tournamentService: TournamentService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private homeService: HomeService,
    private translateService: TranslateService,
  ) { }

  async ngOnInit() {
    this.lng = localStorage.getItem('lng');

    this.activeRoute.parent.params.subscribe((params) => {
      this.filter.title = params['name'];
    });

    this.subscription = this.homeService._champInfo.subscribe((champInfo) => {
      this.tournament = champInfo[1];

      this.datechamp = this.tournament?.champFrom;
      this.getChampInfo();
    });

    this.homeService.getChampInfo(this.filter.title);
    this.tournamentService
      .getCountries({
        title: this.filter.title,
        lng: this.lng,
        all: false,
      })
      .subscribe((response) => {
        this.countries = Object.values(response);
      });

    this.tournamentService.getClubs({ title: this.filter.title }).subscribe((response) => {
      this.champclubs = Object.values(response);
    });

    this.tournamentService.getCategories({ title: this.filter.title }).subscribe((response) => {
      this.categories = Object.values(response);
      // console.log(this.categories);
    });

    this.tournamentService
      .getCoaches({ title: this.filter.title })
      .subscribe((response) => {
        this.coaches = Object.values(response);
      });

    this.tournamentService.getParticipants(this.filter).subscribe((response: any) => {
      this.participants = Object.values(response.participants);

      this.participants = this.participants.map((p: any) => {
        if (p.FIO) {
          const spl = p.FIO.split(' ')
          const name = spl[0]
          const lastName = spl[1]
          p.FIO = name + ' ' + lastName;
        }

        if (p.Photo) {
          const photo = p.Photo.split('/');
          p.Photo = this.defaultPhotosDir + '/' + photo[photo.length - 1];
        } else {
          p.Photo = this.defaultPhotosDir + '/' + 'default-photo.svg';
        }

        if (p.categoryId) {
          p.categoryId = p.categoryId.split(',')
        }
        p.FullAge = this.age_count(p.DateBR);
        return p;
      });
      this.onFilter();
      this.onPageSelect();
    });

    this.translateService.onLangChange.subscribe((event) => {
      this.lng = localStorage.getItem('lng');
      this.getChampInfo();
      this.loadRegions(this.selectedCountry);
      this.onRegionSelect();
      this.onPageSelect();
    });
  }

  loadRegions(country) {
    this.homeService.getAllRegions({ country, lng: this.lng }).subscribe((response) => {
      this.regions = Object.values(response);
    });
  }

  onCountrySelect(country) {
    this.loadRegions(country);
  }

  onClubSelect(club) {
    let idx = this.champclubs.findIndex(
      (x) => x.id == this.selectedClub
    );
    this.club = null;
    if (idx >= 0) { this.club = this.champclubs[idx].name }
    this.filterData();
  }

  onRegionSelect() {
    this.region = null;
    let idx = this.regions.findIndex(
      (x) => x.regionId == this.selectedRegion
    );
    // let lng = localStorage.getItem('lng');

    if (idx >= 0) {
      if (this.lng.toUpperCase() == "UA") { this.region = this.regions[idx].regionNameUa }
      if (this.lng.toUpperCase() == "RU") { this.region = this.regions[idx].regionNameRu }
      if (this.lng.toUpperCase() == "EN") { this.region = this.regions[idx].regionNameEn }
    }
    this.filterData();
  }

  onPageSelect(){
    // let lng = localStorage.getItem('lng');
    if (this.lng.toUpperCase() == "UA") { 
      this.helppage = "https://support.microsoft.com/ru-ru/office/%D0%B8%D0%B7%D0%BC%D0%B5%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5-%D0%BC%D0%B0%D1%81%D1%88%D1%82%D0%B0%D0%B1%D0%B0-%D0%BB%D0%B8%D1%81%D1%82%D0%B0-%D0%B4%D0%BB%D1%8F-%D0%BF%D0%B5%D1%87%D0%B0%D1%82%D0%B8-3ea263ac-c952-40b4-9a6c-515e8c69b826#:~:text=%D0%9F%D0%B5%D1%87%D0%B0%D1%82%D1%8C%20%D0%BB%D0%B8%D1%81%D1%82%D0%B0%20%D0%BF%D0%BE%20%D1%88%D0%B8%D1%80%D0%B8%D0%BD%D0%B5%20%D1%81%D1%82%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D1%8B&text=%D0%9D%D0%B0%20%D0%B2%D0%BA%D0%BB%D0%B0%D0%B4%D0%BA%D0%B5%20%D0%A1%D1%82%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D0%B0%20%D1%83%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%B8%D1%82%D0%B5%20%D1%84%D0%BB%D0%B0%D0%B6%D0%BE%D0%BA,%D0%B4%D0%BB%D1%8F%20%D1%88%D0%B8%D1%80%D0%B8%D0%BD%D1%8B%20%D0%B2%20%D0%BE%D0%B4%D0%BD%D1%83%20%D1%81%D1%82%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D1%83)." 
    }
    if (this.lng.toUpperCase() == "RU") { 
      this.helppage = "https://support.microsoft.com/ru-ru/office/%D0%B8%D0%B7%D0%BC%D0%B5%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5-%D0%BC%D0%B0%D1%81%D1%88%D1%82%D0%B0%D0%B1%D0%B0-%D0%BB%D0%B8%D1%81%D1%82%D0%B0-%D0%B4%D0%BB%D1%8F-%D0%BF%D0%B5%D1%87%D0%B0%D1%82%D0%B8-3ea263ac-c952-40b4-9a6c-515e8c69b826#:~:text=%D0%9F%D0%B5%D1%87%D0%B0%D1%82%D1%8C%20%D0%BB%D0%B8%D1%81%D1%82%D0%B0%20%D0%BF%D0%BE%20%D1%88%D0%B8%D1%80%D0%B8%D0%BD%D0%B5%20%D1%81%D1%82%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D1%8B&text=%D0%9D%D0%B0%20%D0%B2%D0%BA%D0%BB%D0%B0%D0%B4%D0%BA%D0%B5%20%D0%A1%D1%82%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D0%B0%20%D1%83%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2%D0%B8%D1%82%D0%B5%20%D1%84%D0%BB%D0%B0%D0%B6%D0%BE%D0%BA,%D0%B4%D0%BB%D1%8F%20%D1%88%D0%B8%D1%80%D0%B8%D0%BD%D1%8B%20%D0%B2%20%D0%BE%D0%B4%D0%BD%D1%83%20%D1%81%D1%82%D1%80%D0%B0%D0%BD%D0%B8%D1%86%D1%83)." 
    }
    if (this.lng.toUpperCase() == "EN") { 
      this.helppage = "https://support.microsoft.com/en-au/office/scale-the-sheet-size-for-printing-3ea263ac-c952-40b4-9a6c-515e8c69b826" 
    }
  }

  filterData() {
    this.customParticipants = JSON.parse(JSON.stringify(this.participants));

    this.command = '';
    if (this.selectedRegion) {
      this.customParticipants = this.customParticipants.filter(p => p.RegionId == this.selectedRegion);
      this.command = this.region;
    }

    if (this.selectedClub) {
      this.customParticipants = this.customParticipants.filter(p => p.ClubId == this.selectedClub);
      if (this.customParticipants.length > 0) {
        if (this.command.length > 0){
        this.command = this.command + ', ' + this.customParticipants[0].ClubName}
        else{this.command = this.customParticipants[0].ClubName}
      };
    }

    if (this.selectedCoach) {
      this.customParticipants = this.customParticipants.filter(p => p.CoachId == this.selectedCoach);
      if (this.customParticipants.length > 0 && this.command.length == 0) {
        this.command = this.customParticipants[0].ClubName
      };
    }

  }

  onCoachSelect(coach) {
    let idx = this.coaches.findIndex(
      (x) => x.id == this.selectedCoach
    );
    this.coach = null;
    if (idx >= 0) { this.coach = this.coaches[idx].name }
    this.filterData();
  }

  onFilter() {
    // this.customParticipants = JSON.parse(JSON.stringify(this.participants));

    // if(this.searchValue) {
    //   this.customParticipants = this.participants.filter(p => p.FIO.toLowerCase().includes(this.searchValue.toLowerCase()));
    // } else{
    //   this.customParticipants = JSON.parse(JSON.stringify(this.participants))
    // }
  }

  getWeightCategory(participant){
    let result = '';
    let catId = participant.categoryId[0];
    let category = this.categories.filter((x) => x.categoryId == catId);
    let prefixUp = '';
    let prefixDown = '';
    if (this.lng.toUpperCase() == "UA") { 
      prefixUp = 'до ';
      prefixDown = 'понад ';
    }
    if (this.lng.toUpperCase() == "RU") { 
      prefixUp = 'до ';
      prefixDown = 'свыше ';
    }
    if (this.lng.toUpperCase() == "EN") { 
      prefixUp = 'up to ';
      prefixDown = 'over ';
    }

    // console.log(category[0].WeightFrom, category[0].WeightTo);
    
    if(category && category[0]){
      if(category[0].WeightTo && category[0].WeightFrom){
        if(category[0].WeightFrom && category[0].WeightFrom <= 0){
          result = prefixUp + Math.round(category[0].WeightTo).toString()
        } else {
          if(category[0].WeightTo && category[0].WeightTo >= 1000){
            result = prefixDown + Math.round(category[0].WeightFrom).toString()
          } else {
            result = Math.round(category[0].WeightFrom).toString() + ' - ' + Math.round(category[0].WeightTo).toString()
          } 
        }
      }
    } 
    return result;     
  }

  age_count(datebr) {
    if (!this.datechamp) {
      return ''
    }

    let sqlDT = datebr;
    let BD = new Date(sqlDT.replace(' ', 'T'));

    let dateChamp = this.datechamp;
    let DC = new Date(dateChamp.replace(' ', 'T'));

    return Math.round(((DC.getTime() - BD.getTime()) / (24 * 3600 * 365.25 * 1000)) | 0);
  }

  numToPr(number) {
    const
      hRU = ['сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'],
      tRU = ['', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'],
      oRU = ['один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять'],
      pRU = ['одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать', 'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'],
      dRU = ['десять'];
    const
      hUA = ['сто', 'двісті', 'триста', 'чотириста', 'п`ятьсот', 'шістьсот', 'сімьсот', 'вісімьсот', 'дев`ятьсот'],
      tUA = ['', 'двадцять', 'тридцять', 'сорок', 'п`ятдесят', 'шістдесят', 'сімдесят', 'вісімдесят', 'дев`яносто'],
      oUA = ['один', 'два', 'три', 'чотири', 'п`ять', 'шість', 'сім', 'вісім', 'дев`ять'],
      pUA = ['одинадцять', 'дванадцять', 'тринадцять', 'чотирнадцять', 'п`ятнадцять', 'шістнадцять', 'сімнадцять', 'вісімнадцять', 'дев`ятнадцять'],
      dUA = ['десять'];
    const
      hEN = ['one hundred', 'two hundred', 'three hundred', 'four hundred', 'five hundred', 'six hundred', 'seven hundred', 'eight hundred', 'nine hundred'],
      tEN = ['', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'],
      oEN = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
      pEN = ['eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'],
      dEN = ['ten'];

    let h = [];
    let t = [];
    let o = [];
    let p = [];
    let d = [];

    // let lng = localStorage.getItem('lng');
    if (this.lng === 'ru') {
      h = hRU;
      t = tRU;
      o = oRU;
      p = pRU;
      d = dRU;
    }
    if (this.lng === 'ua') {
      h = hUA;
      t = tUA;
      o = oUA;
      p = pUA;
      d = dUA;
    }
    if (this.lng === 'en') {
      h = hEN;
      t = tEN;
      o = oEN;
      p = pEN;
      d = dEN;
    }

    let str = number.toString(), out = '';

    switch (str.length) {
      case 1:
        out = o[number - 1];
        break;
      case 2:
        if (str[0] == '1') {

          if (str[1] == '0') { out = d[0] } else { out = p[parseInt(str[1]) - 1] }

        }
        else { out = (t[parseInt(str[0]) - 1] + ((str[1] != '0') ? (' ' + o[parseInt(str[1]) - 1]) : '')) }
        break;
      case 3:
        if (str[1] == '1') {
          out = (h[parseInt(str[0]) - 1] + ((str[2] != '0') ? (' ' + p[parseInt(str[2]) - 1]) : ''));
        } else {
          out = (h[parseInt(str[0]) - 1] + ((str[1] != '0') ? (' ' + t[parseInt(str[1]) - 1]) : '') + ((str[2] != '0') ? (' ' + o[parseInt(str[2]) - 1]) : ''));
        }
        break;
    }
    return out;
  }

  getChampInfo() {
    // let lng = localStorage.getItem('lng');
    if (this.lng === 'ru') {
      this.champName = this.tournament?.champNameRu;
      this.citychamp = this.tournament?.champCityRu;
    }
    if (this.lng === 'ua') {
      this.champName = this.tournament?.champNameUa;
      this.citychamp = this.tournament?.champCityUa;
    }
    if (this.lng === 'en') {
      this.champName = this.tournament?.champNameEn;
      this.citychamp = this.tournament?.champCityEn;
    }
    this.champInfo = this.tournament?.champNameEn;
  }



  tabletoExcel(table, name) {
    var uri = 'data:application/vnd.ms-excel;base64,'
      , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>'
      , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))); }
      , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }); };
    table = document.getElementById(table);
    var ctx = { worksheet: name || 'Worksheet', table: table.innerHTML };
    const downloadLink = document.createElement('a');
    downloadLink.href = uri + base64(format(template, ctx));
    downloadLink.download = 'personal-app.xls';
    downloadLink.click();
    document.removeChild(downloadLink);
    // window.location.href = uri + base64(format(template, ctx));
  }

  clearSelect() {
    setTimeout(() => {
      this.selectedCountry = null;
      this.selectedClub = null;
      this.selectedCoach = null;
    });
  }

  // changeCoach() {
  //   window.scrollTo(0, 0);
  //   this.clearSelect();
  // }

  // expandCoaches() {
  //     this.coachSelector.open();
  // }

  // collapseCoaches() {
  //     this.coachSelector.close();
  // }

  // blurCoaches() {
  //   this.coachSelector.blur();
  // }



}
