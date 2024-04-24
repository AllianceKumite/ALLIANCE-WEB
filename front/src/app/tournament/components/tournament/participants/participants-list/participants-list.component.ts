import { AfterViewInit, Component, HostListener, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { TournamentService } from '../../../../services/tournament.service';
import { Participant } from '../../../../models/participant.model';
import { environment } from '../../../../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { HomeService } from 'src/app/shared/services/home.service';

// import { ConsoleReporter } from 'jasmine';

@Component({
  selector: 'app-participants-list',
  templateUrl: './participants-list.component.html',
  styleUrls: ['./participants-list.component.css']
})
export class ParticipantsListComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  dtLangOptions = {
    'ua': {
      "lengthMenu": 'Показати _MENU_ записів',
      "info": 'Показана сторінка _PAGE_ з _PAGES_',
      "search": "Пошук:",
      "paginate": {
        "first": "Перша",
        "last": "Остання",
        "previous": "Попередня",
        "next": "Наступна"
      }
    },
    'ru': {
      "lengthMenu": 'Показать _MENU_ записей',
      "info": 'Показана страница _PAGE_ с _PAGES_',
      "search": "Поиск:",
      "paginate": {
        "first": "Первая",
        "last": "Последняя",
        "previous": "Предыдущая",
        "next": "Следующая"
      }
    },
    'en': {
      "lengthMenu": "Show _MENU_ entries",
      "info": "Showing page _PAGE_ of _PAGES_",
      "search": "Search:",
      "paginate": {
        "first": "First",
        "last": "Last",
        "previous": "Previous",
        "next": "Next"
      }
    }
  }
  categories: any[] = [];
  categoriesWithAll: any[] = [];

  dtOptions: DataTables.Settings;

  dtTrigger: Subject<any> = new Subject<any>();

  participants: Participant[] = [];
  countparticipants = 0;

  customParticipants: Participant[] = [];

  champType: number;
  showClubsFilter: boolean = false;
  showCountriesFilter: boolean = false;
  showCoachesFilter: boolean = false;

  filterLabel: string;

  champName: string;
  items: Array<any>;
  initialPage = 1;
  pageSize = 7;
  searchValue: string = '';
  lastName: string;
  firstName: string;

  filter: any = {
    title: null,
    category: null
  }

  athletePhotosDir: string = `${environment.mediaDir}/athletes_photo`;
  defaultPhotosDir: string = environment.photoDir;

  isShowPhotos: boolean = false;

  isMobileView: boolean = false;

  info;
  clubs: any[] = [];
  selectedclub;
  selectedcategory;

  readonly logosDir: string = `${environment.logosDir}`;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.isMobileView = event.target.screen.width < 990;
  }

  constructor(
    private tournamentService: TournamentService,
    private activatedRouter: ActivatedRoute,
    private translateService: TranslateService,
    private router: Router,
    private homeService: HomeService,

  ) { }

  ngOnChanges() {
  }

  ngOnInit(): void {
    this.isMobileView = window.screen.width < 990;

    let lng = localStorage.getItem('lng');

    this.dtOptions = {
      lengthChange: false,
      destroy: true,
      pagingType: "full_numbers",
      pageLength: 50,
      paging: true,
      searching: true,
      responsive: true,
      autoWidth: true,
      ordering: false,
      language: this.dtLangOptions[lng]
    };

    this.activatedRouter.parent.params.subscribe(params => {
      this.champName = params["name"];

      // this.athletePhotosDir += '/' + this.champName;

      this.filter = {
        title: this.champName,
      };
    });

    this.homeService._champInfo.subscribe(champInfo => this.info = champInfo[1] || null)

    this.activatedRouter.queryParamMap.subscribe(queryParams => {
      this.filter.category = queryParams?.get('category');
      this.filter.coach = queryParams?.get('coach');
      this.filter.club = queryParams?.get('club');
      this.selectedclub = this.filter.club;

      this.filter.country = queryParams?.get('country');
      this.tournamentService.getChampType(this.filter.title).subscribe(response => {
        this.champType = response["type"];
      });

      this.tournamentService.getParticipantscount(this.filter).subscribe(response => {
       
        this.countparticipants = response['count'];
        // console.log(this.countparticipants);
        
      });

      this.homeService
      .getCategories({ title: this.filter.title })
      .subscribe((response: any[]) => this.initCategories(response));


      this.tournamentService.getParticipants(this.filter).subscribe((response: any) => {
        this.participants = Object.values(response.participants);
        this.filterLabel = this.filter && (this.filter.coach || this.filter.club) ? response.filter : null;

        this.participants = this.participants.map((p: any) => {
          if (p.FIO) {
            p.FIO = this.getFIO(p.FIO);
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

          return p;
        });
        this.onInputSearch();
        this.rerender();
      });

    });

    this.translateService.onLangChange.subscribe((event) => {
      this.resetLanguageOptions(event.lang);
      this.rerender();
    })

    this.tournamentService.getClubs({ title: this.champName }).subscribe((response) => {
      this.clubs = Object.values(response);
      this.clubs.sort(function (a, b) {
        return a.ClubId - b.ClubId
      })
      this.clubs.splice(0, 0, { count: 0, id: 0, logo: "", name: "All" });
    });

    // document.querySelector('box-data-part').scrollIntoView({
    //   behavior: 'smooth',
    //   block: 'start'
    // });

    let box = document.getElementById('box-data-part');
    box.scrollIntoView({ block: "start", behavior: "smooth"});
  //   window.scrollTo({
  //     top: box.offsetTop, // Здесь вычисление позиции может быть сложнее
  //     behavior: 'smooth', // Плавность прокрутки, убрать если не нужно
  // });
  // box.scrollTo(0, 0);
    // window.scrollTo(0, 0);
  }

  initCategories(response) {
   
    if (response) {
      let vals = Object.values(response);

      this.categories = Object.keys(response).map((w, index) => {
        return { id: w, name: vals[index] };
      });

      this.categoriesWithAll = JSON.parse(JSON.stringify(this.categories));

      this.categoriesWithAll.unshift({
        id: '0',
        name: this.translateService.instant('general.allParticipants'),
      });
    }
  }

  getParticipantsByClub(item) {
    this.selectedcategory = -1;
    if (item.id == 0) {
      if (this.filter.title) {
        this.router.navigate(['champ/' + this.filter.title + '/participants'], { queryParams: { 'category': 0 } });
        window.scrollTo(0, 0);
      }
    } else {
      if (this.filter.title) {
        this.router.navigate(['champ/' + this.filter.title + '/participants'], { queryParams: { 'club': item.id } });
        window.scrollTo(0, 0);
      }
    }
  }

  getCategory(category){
    this.selectedclub = -1;
    this.selectedcategory = category.id;
    this.router.navigate(['champ/' + this.filter.title + '/participants'], { queryParams: { 'category': category.id } });
  }

  onClubsClick(item) {
    this.filter.club = item.id;
    this.selectedclub = this.filter.club;
    this.tournamentService.getParticipants(this.filter).subscribe((response: any) => {
      this.participants = Object.values(response.participants);
      this.filterLabel = this.filter && (this.filter.coach || this.filter.club) ? response.filter : null;

      this.participants = this.participants.map((p: any) => {
        if (p.FIO) {
          p.FIO = this.getFIO(p.FIO);
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

        return p;
      });
      this.onInputSearch();
      this.rerender();
    });
  }

  isCirilic(data) {
    const regExp = /^[?!,.а-яА-ЯёЁіІїЇ0-9\s]+$/;
    let result = regExp.test(data);
    return result;
  }

  getAge(date) {
  }

  parseFio(FIO) {
    let splitted = FIO?.split(' ');
    this.lastName = splitted?.length > 0 ? splitted[1] : '';
    this.firstName = splitted?.length > 1 ? splitted[0] : '';

    // if(this.isCirilic(FIO)){
    //   this.lastName = splitted?.length > 0 ? splitted[1] : '';
    //   this.firstName = splitted?.length > 1 ? splitted[0] : '';  
    // } 
    // else{
    //   this.lastName = splitted?.length > 0 ? splitted[0] : '';
    //   let fname1 = splitted?.length > 1 ? splitted[1] : '';
    //   let fname2 = splitted?.length > 2 ? splitted[2] : '';
    //   let fname3 = splitted?.length > 3 ? splitted[3] : '';

    //   this.firstName = fname1 + ' ' + fname2 + ' ' +fname3;  
    // }
  }

  getFIO(FIO) {
    this.parseFio(FIO);
    return this.firstName + ' ' + this.lastName;
  }

  resetLanguageOptions(lng) {
    lng = lng ? lng : localStorage.getItem('lng');
    this.dtOptions.language = this.dtLangOptions[lng]

    // this.rerender();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  onInputSearch() {
    if (this.searchValue) {
      this.customParticipants = this.participants.filter(p => p.FIO.toLowerCase().includes(this.searchValue.toLowerCase()));
    } else {
      this.customParticipants = JSON.parse(JSON.stringify(this.participants))
    }
    this.customParticipants.sort(function (a, b) {
      let result = 0
      result = a.ClubId - b.ClubId
      // if(result == 0){
      //   let aFio = a.FIO.toLocaleLowerCase();
      //   let bFio = b.FIO.toLocaleLowerCase();
      //   result = bFio.localeCompare(aFio, 'base', {ignorePunctuation: true});
      // }
      return result
    })
  }

  clearSearch() {
    this.searchValue = '';
    this.onInputSearch();
  }

  rerender(): void {
    let boxdata = document.getElementById('box-data');
    boxdata?.scroll(0, 0);
    if (this.dtElement) {
      // this.filterLabel = this.filter.category || this.filter.coach || this.filter.club || this.filter.contry;

      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        dtInstance.destroy();
        this.dtTrigger.next(null);
      });
    }
  }

  showPhotos($event) {
    this.isShowPhotos = $event;
  }

  setCategory(categoryId) {
    if (categoryId && this.filter.title) {
      this.router.navigate(['champ/' + this.filter.title + '/draw'], { queryParams: { 'category': categoryId } });
    }
  }

  onShowPhoto() {
    this.isShowPhotos = !this.isShowPhotos;
  }
}
