/**
 * @author Ilya
 */
import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import {
  Coach,
  Filter,
} from './../../../admin/manage-participants/model/athlete';
import { TranslateService } from '@ngx-translate/core';
import { concatWith } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  constructor(
    private renderer: Renderer2,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private translateService: TranslateService
  ) { }

  videos: any[] = [
    { id: 1, name: 'Registraton user', path: 'user' },
    { id: 2, name: 'Registration Athlete', path: 'athlete' },
    { id: 3, name: 'Registration Athlete', path: 'managetournament' },
  ];


  isAuthUser: boolean;
  public authUser: string = '';
  public isSuperAdmin: boolean = false;
  hasRightToManage: boolean = false;
  nameOfChampionship: string = '';

  filter: Filter;
  videofile;
  selectedVideo;

  async ngOnInit() {
    this.filter = new Filter();
    this.initUser();
    this.isAuthUser = this.filter.isSuperAdmin;
    this.authUser = this.filter.coach;
    window.scrollTo(0, 0);
    this.getVideoName();
    this.translateService.onLangChange.subscribe((event) => {
      this.getVideoName();
    });

  }

  setVideo() {
    let lng = localStorage.getItem('lng');
    if (this.selectedVideo) {
      switch (this.selectedVideo) {
        case 1:
          if (lng.toUpperCase() == "UA") {
            this.videofile = "https://www.youtube.com/watch?v=LFof1n7W-bU"
          }
          if (lng.toUpperCase() == "RU") {
            this.videofile = "https://www.youtube.com/watch?v=LFof1n7W-bU"
          }
          if (lng.toUpperCase() == "EN") {
            this.videofile = "https://www.youtube.com/watch?v=CpjscmaOaDQ"
          }

        case 2:
          if (lng.toUpperCase() == "UA") {
            this.videofile = "https://www.youtube.com/watch?v=bu1WwS3lMLQ"
          }
          if (lng.toUpperCase() == "RU") {
            this.videofile = "https://www.youtube.com/watch?v=bu1WwS3lMLQ"
          }
          if (lng.toUpperCase() == "EN") {
            this.videofile = "https://www.youtube.com/watch?v=MOhmu4EAxHk"
          }

        case 3:
          if (lng.toUpperCase() == "UA") {
            this.videofile = "https://www.youtube.com/watch?v=3px5MDgDLqU"
          }
          if (lng.toUpperCase() == "RU") {
            this.videofile = "https://www.youtube.com/watch?v=3px5MDgDLqU"
          }
          if (lng.toUpperCase() == "EN") {
            this.videofile = "https://www.youtube.com/watch?v=3px5MDgDLqU"
          }
      }
    }
    this.selectedVideo = null;
  }

  getVideoName() {
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

  openMenu() {
    const burger = document.getElementById('burger');
    const btnOpen = document.getElementById('open');
    const btnClose = document.getElementById('close');

    this.renderer.setStyle(burger, 'bottom', 'calc(0% - 70px)');
    this.renderer.setStyle(btnOpen, 'display', 'none');
    this.renderer.setStyle(btnClose, 'display', 'block');
  }

  closeMenu() {
    const burger = document.getElementById('burger');
    const btnOpen = document.getElementById('open');
    const btnClose = document.getElementById('close');

    this.renderer.setStyle(burger, 'bottom', '100%');
    this.renderer.setStyle(btnOpen, 'display', 'block');
    this.renderer.setStyle(btnClose, 'display', 'none');
  }

  async initUser() {
    this.authenticationService.isSuperAdmin().subscribe((response) => {
      this.filter.isSuperAdmin = (response as any).isSuperAdmin;

      this.authenticationService.getCurrentUser().subscribe((response) => {
        this.filter.coach = (response as any)?.coach;
      });
    });
  }

  logout() {
    this.authenticationService.logout();
    this.filter.coach = '';
    this.filter.isSuperAdmin = false;
  }

  login() {
    this.router.navigateByUrl('/login');

    this.authenticationService.isSuperAdmin().subscribe((response) => {
      let userIsSuperAdmin = (response as any).isSuperAdmin;

      this.hasRightToManage = userIsSuperAdmin;

      if (!this.hasRightToManage) {
        this.authenticationService.getCurrentUser().subscribe((response) => {
          this.hasRightToManage =
            this.authenticationService.userHasRightToManageTournament(
              response as any,
              this.nameOfChampionship
            );
          this.authUser = (response as any)?.coach;
        });
      } else {
        this.authUser = 'AllianceKumite';
      }
    });
  }

}

