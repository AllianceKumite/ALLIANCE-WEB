import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { share, switchMap, shareReplay, map, debounceTime } from "rxjs/operators";
import { environment } from "./../../../environments/environment";


interface ChampInfo {

}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  http: HttpClient;

  public champInfo$ = new Subject()
  public _champInfo: Observable<any>;

  private countries$: Observable<any>;
  private regions$: Observable<any>;
  private clubs$: Observable<any>;
  private organizations$: Observable<any>;

  baseUrl: string = environment.serverApiUrl;

  constructor(http: HttpClient) {
    this.http = http;

    this._champInfo = this.champInfo$.pipe(
      debounceTime(1000),
      switchMap(params => this.http.post<any>(`${this.baseUrl}/coach/api-get-champ-info`, params)),
      share() //!
    )
  }

  cleanCache() {
    // this.champInfo$ = null;
    this.countries$ = null;
    this.regions$ = null;
    this.clubs$ = null;
    this.organizations$ = null;
  }

  getCategories(filter) {
    return this.http.post(`${this.baseUrl}/api-champ-get-categories`, filter);
  }

  getChampInfo(name: string) {
    if (name) {
      this.champInfo$.next({ 'title': name })
    }
  }

  getAllCountries() {
    if (!this.countries$) {
      this.countries$ = this.cachedRequest(`${this.baseUrl}/api-champ-get-countries`, null, true)
    }

    return this.countries$
  }

  // getCountries(filter: any) {
  //   return this.http.post(`${this.baseUrl}/api-champ-get-countries`, filter);
  // }

  getAllRegions(filter) {
    // if (!this.regions$) {
    this.regions$ = this.cachedRequest(`${this.baseUrl}/api-get-regions`, filter, true)
    // }

    return this.regions$
  }

  getAllClubs(filter) {
    // return this.http.get(`${this.baseUrl}/api-get-clubs`).toPromise();
    // if (!this.clubs$) {
    this.clubs$ = this.cachedRequest(`${this.baseUrl}/api-get-clubs`, filter, true)
    // }

    return this.clubs$
  }

  getAnyClubs() {

    return this.http.post(`${this.baseUrl}/api-get-any-clubs`, true);

    // if (!this.clubs$) {
    //   this.clubs$ = this.cachedRequest(`${this.baseUrl}/api-get-any-clubs`, null, true)
  }


  // return this.http.get(`${this.baseUrl}/api-get-clubs`).toPromise();
  // if (!this.clubs$) {
  // this.clubs$ = this.cachedRequest(`${this.baseUrl}/api-get-any-clubs`, '', true)
  // }

  // return this.clubs$
  // }

  getCurrentChamp() {
    return this.http.get(`${this.baseUrl}/api-get-current-champ`).toPromise();
  }

  getAllCities(filter) {
    return this.http.post(`${this.baseUrl}/api-get-city`, filter).toPromise();
  }

  getAllOrganization() {
    if (!this.organizations$) {
      this.organizations$ = this.cachedRequest(`${this.baseUrl}/api-get-organization`, null, false)
    }

    return this.organizations$
    // return this.http.get(`${this.baseUrl}/api-get-organization`).toPromise();
  }

  getCurrentValidChamp() {
    return this.http.get(`${this.baseUrl}/coach/api-get-current-valid-champ`).toPromise();
  }

  getCurrentValidChampWithTitle(title) {
    return this.http.post(`${this.baseUrl}/coach/api-get-valid-champ-with-title`, { title }).toPromise();
  }
  getAllBranch() {
    return this.http.get(`${this.baseUrl}/api-get-branch`).toPromise();
  }
  getCoachById(coachId: number, lng: string) {
    return this.http.post(`${this.baseUrl}/coach/api-get-coaches-by-id/${coachId}`, { lng: lng });
  }

  updateCoach(model: any) {
    return this.http.post(`${this.baseUrl}/coach/api-update-coach`, model);
  }

  cachedRequest(url, params, isPost) {
    let request = isPost
      ? this.http.post<any>(url, params)
      : this.http.get<any>(url)

    return request.pipe(
      map((result: any) => result),
      shareReplay(1)
    ) as Observable<any>
  }
}
