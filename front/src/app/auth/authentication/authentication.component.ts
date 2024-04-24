import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
// import { Observable } from 'rxjs';
// import { User } from '../models/user';
import { AuthenticationService } from '../../shared/services/authentication.service'
import { HomeService } from '../../shared/services/home.service';

// TODO
// https://blog.angular-university.io/angular-jwt-authentication/
@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit {
  email: string;
  password: string;

  isSuperAdmin: boolean;

  error: string = '';
  nameOfChamp: any;
  parentPath : any;

  constructor(private authenticationService: AuthenticationService,
              private homeService: HomeService,
              private router: Router,
              private activeRoute: ActivatedRoute
    ) { }

  async ngOnInit() {
      if (this.activeRoute.parent.parent) {
          this.activeRoute.parent.parent.params.subscribe(params => {
              this.nameOfChamp = params.name;
          });
      }
  }

  async login() {
    const user = {
        email: this.email,
        password: this.password
    };

    const isUserValid = user && user.email && user.password;

    if (isUserValid) {
        this.authenticationService.login(user).subscribe(async response => {

            const superAdminRequired = this.activeRoute.snapshot.queryParams['superAdmin'] || false;
            this.isSuperAdmin = (await (this.authenticationService.isSuperAdmin().toPromise()) as any).isSuperAdmin;

            let returnUrl = this.activeRoute.snapshot.queryParams['returnUrl']

            if (!returnUrl) {
                if (this.isSuperAdmin) {
                    returnUrl = '/administrator';
                } else if (this.nameOfChamp !== undefined) {
                    returnUrl = '/champ/' + this.nameOfChamp + '/coach';
                } else {
                    returnUrl = '/coach';
                }
                this.router.navigateByUrl('');
            } else {
                if (!superAdminRequired || superAdminRequired && this.isSuperAdmin) {
                    this.router.navigateByUrl(returnUrl);
                    // this.router.navigateByUrl('');
                } else {
                    this.error = "notAuthorized";
                }
            }
            // if (!superAdminRequired || superAdminRequired && this.isSuperAdmin) {
            //     this.router.navigateByUrl(returnUrl);
            //     // this.router.navigateByUrl('');
            // } else {
            //     this.error = "notAuthorized";
            // }
        }, error => {
            this.error = 'notExist';
        });
    }
  }

  logout() {
      this.router.navigateByUrl('/');
      this.authenticationService.logout();
      this.error = ''
  }
}
