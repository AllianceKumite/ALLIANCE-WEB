import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../shared/services/authentication.service';

@Component({
  selector: 'app-forgot-password-reset',
  templateUrl: './forgot-password-reset.component.html',
  styleUrls: ['./forgot-password-reset.component.css']
})
export class ForgotPasswordResetComponent implements OnInit {
  password: string;
  username: string;
  email: string;
  submitted: boolean = false;
  resetSuccessfully = null;

  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private activeRouter: ActivatedRoute
    ) { }

  async ngOnInit() {
    this.activeRouter.queryParams.subscribe(param => {
      this.username = param['username'];
      this.email = param['email'];
    })
  }

  login() {
    const user = {
      password: this.password,
      username: this.username,
      email: this.email
    };

    const isUserValid = user && user.password && user.email && user.username;

    if (isUserValid) {
      this.submitted = true;

      this.authenticationService.resetPasswordCoach(user).subscribe(response => {
          this.resetSuccessfully = true
          // this.router.navigateByUrl('');
      }, error => {
          this.resetSuccessfully = false
      })
    }
  }
}
