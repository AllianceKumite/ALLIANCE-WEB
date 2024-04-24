import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router} from '@angular/router';
import { HomeService } from '../../../shared/services/home.service';
import {Subscription} from 'rxjs';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
    champName: string;
    info;
    isSuperAdmin;
    hasRightToManage;
    nameOfChampionship;
    userLabel;

    private subscription: Subscription;

    constructor(
        private router: Router,
        private homeService: HomeService,
        private authenticationService: AuthenticationService,

    ) {
        router.events.subscribe((val) => {
            this.champName = this.defineChampName();
            this.homeService.getChampInfo(this.champName);
        });
    }

    ngOnInit(): void {
        this.subscription = this.homeService._champInfo.subscribe(champInfo => this.info = champInfo[1] || null)
        this.initHasRightToManage();

    }

    initHasRightToManage() {
      this.authenticationService.isSuperAdmin().subscribe((response) => {
        let userIsSuperAdmin = (response as any).isSuperAdmin;
        this.isSuperAdmin = userIsSuperAdmin;
  
        this.hasRightToManage = userIsSuperAdmin;
  
        if (!this.hasRightToManage) {
          this.authenticationService.getCurrentUser().subscribe((response) => {
            this.hasRightToManage =
              this.authenticationService.userHasRightToManageTournament(
                response as any,
                this.nameOfChampionship
              );
            this.userLabel = (response as any)?.coach;
          });
        } else {
          this.userLabel = 'AllianceKumite';
        }
      });
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe()
    }

    defineChampName() {
      let locationStr = window.location + '';
      let indexStart = locationStr.indexOf('/champ/') + '/champ/'.length;
      let indexEnd = locationStr.indexOf('/', indexStart);
      indexEnd = indexEnd == -1 ? locationStr.length : indexEnd;
      let name = locationStr.substring(indexStart, indexEnd)

      return name;
  }

  updateChampName() {
    this.champName = this.defineChampName();
  }
}
