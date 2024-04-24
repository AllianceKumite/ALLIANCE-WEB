import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { HomeService } from '../../shared/services/home.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  REDIRECT_TIMEOUT = 4000;
  username: string;
  email: string;
  resetSuccessfully: boolean = true;
  submitted: boolean = false;


  constructor(private authenticationService: AuthenticationService,
              private homeService: HomeService,
              private router: Router
    ) { }

  async ngOnInit() {
    // this.lng = localStorage.getItem('lng');
  }

  login() {
    const user = {
      username: this.username,
      email: this.email,
      lng: localStorage.getItem('lng')
    };

    const isUserValid = user && user.email && user.username;

    if (isUserValid) {
        this.submitted = true;

        this.authenticationService
            .resetPasswordEmail(user)
            .subscribe(response => {
                this.resetSuccessfully = true;

                // setTimeout(() => {
                //     this.router.navigateByUrl('');
                // }, this.REDIRECT_TIMEOUT)
            }, error => {
                this.resetSuccessfully = false;
            })

    }
  }
}
