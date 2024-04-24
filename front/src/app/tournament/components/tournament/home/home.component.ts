import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { HomeService } from './../../../../shared/services/home.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  readonly mediaDir = `${environment.mediaDir}`;
  readonly assetsDir = `${environment.assetsDir}`;
  // TODO: Champ type
  champ: any;
  champName: string = ''

  subscription: Subscription
  videofile;

  constructor(
    private homeService: HomeService,
    private activeRoute: ActivatedRoute,
    private translateService: TranslateService

  ) {
  }

  ngOnInit(): void {
    window.scroll(0,0);
    this.subscription = this.homeService._champInfo.subscribe(champInfo => this.champ = champInfo[1] || null)

    this.activeRoute.parent.params.subscribe(params => {
        const name = params["name"];

        this.champName = name
        this.homeService.getChampInfo(this.champName)
    });
    this.getVideoName();
    this.translateService.onLangChange.subscribe((event) => {
      this.getVideoName();
    });

  }

  ngOnDestroy(): void {
      this.subscription?.unsubscribe()
  }

  getVideoName(){
    let lng = localStorage.getItem('lng');
    if (lng.toUpperCase() == "UA") { 
      this.videofile = "https://www.youtube.com/watch?v=LFof1n7W-bU" 
    }
    if (lng.toUpperCase() == "RU") { 
      this.videofile = "https://www.youtube.com/watch?v=LFof1n7W-bU" 
    }
    if (lng.toUpperCase() == "EN") { 
      this.videofile = "https://www.youtube.com/watch?v=CpjscmaOaDQ" 
    }
  }

}
