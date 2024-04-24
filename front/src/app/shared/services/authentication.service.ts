import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  baseUrl: string = environment.serverApiUrl;

  private currentUserSource = new ReplaySubject<User>(1);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient) { }

  public getJWTTOken() {
    const token = JSON.parse(localStorage.getItem('user'))?.token;
    return token;
  }

  public isSuperAdmin() {
      let headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getJWTTOken());

      return this.http.get(`${this.baseUrl}/api-is-super-admin`, {headers});
  }

  public getCurrentUser() {
    let headers = new HttpHeaders().set('Authorization', 'Bearer ' + this.getJWTTOken());
    return this.http.get(`${this.baseUrl}/api-get-current-user`, {headers})
  }

  userHasRightToManageTournament(user, tournamentName) {
      let roles = user?.role;
      let hasRightList = roles?.filter(r => r.role == "1" && r.details == tournamentName)
      let hasRight = hasRightList?.length > 0

      return hasRight
  }

  public isAuthenticated(): boolean {
    const user = JSON.parse(localStorage.getItem('user'))?.token;
    return !!user;
  }

  setCurrentUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  register(model: any) {
      return this.http.post(`${this.baseUrl}/api-registration`, model);
  }

  login(model: any) {
    return this.http.post(`${this.baseUrl}/api-token-auth/`, model).pipe(
      map((response: any) => {
        const user = response;
        if (user) {
          this.setCurrentUser(user);
        }
      })
    );
  }

  // @deprecated
  loginAdmin(model: any) {
    return this.http.post(`${this.baseUrl}/api-token-auth-admin/`, model).pipe(
      map((response: any) => {
        const user = response;
        if (user) {
          this.setCurrentUser(user);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
  }

  resetPasswordEmail(user: any) {
    return this.http.post(`${this.baseUrl}/api-reset-password-email`, user);
  }

  resetPasswordCoach(user: any){
    return this.http.post(`${this.baseUrl}/api-reset-password-coach`, user);
  }
}
