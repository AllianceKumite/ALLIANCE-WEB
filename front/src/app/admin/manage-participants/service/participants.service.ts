import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable, BehaviorSubject, switchMap, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Athlete, AthleteValidation, Gender, GenderOption, Dan, DanOption, Coach, Branch, Filter } from '../model/athlete';
import { Role } from '../../../shared/types/Role';

@Injectable({
  providedIn: 'root',
})

export class ParticipantsService {
  baseUrl: string = environment.serverApiUrl + '/coach';
  #coaches$ = new BehaviorSubject<Branch[]>([]);

  constructor(private http: HttpClient) {}

  public getCoachAth(model: Filter) {
    return this.http.post(
      `${this.baseUrl}/api-champ-get-coach-athletes`,
      model
    );
  }

  public insertNewAth(model: any) {
    return this.http.post(`${this.baseUrl}/api-champ-insert-new-ath`, model);
  }

  public deleteAth(model: any) {
    return this.http.post(`${this.baseUrl}/api-champ-delete-ath`, model);
  }

  public updateAth(model: any) {
    return this.http.post(`${this.baseUrl}/api-champ-update-ath-info`, model);
  }

  public moveToParticipantList(model: any) {
    return this.http
      .post(`${this.baseUrl}/api-champ-insert-ath-into-champ`, model)
      .toPromise();
  }

  public deleteFromParticipantList(model: any) {
    return this.http.post(
      `${this.baseUrl}/api-champ-delete-ath-from-champ`,
      model
    );
  }

  public clearParticipantList(model: any) {
    return this.http.post(
      `${this.baseUrl}/api-champ-clear-coach-ath-list`,
      model
    );
  }

  public setAllKumite(model: any) {
    return this.http.post(`${this.baseUrl}/api-champ-set-all-kumite`, model);
  }

  public setAllKata(model: any) {
    return this.http.post(`${this.baseUrl}/api-champ-set-all-kata`, model);
  }

    getCoaches(): Observable<Branch[]> {
    return this.#coaches$;
  }

  getCoachesByBranch(branchCoachId: number): Observable<Branch[]> {
    return this.http.get<Branch[]>(
      `${this.baseUrl}/api-get-coaches-by-branch/${branchCoachId}`
    );
  }

  getAllBranches(filter: { title: string }): Observable<Branch[]> {
    return this.http.post<Branch[]>(
      `${this.baseUrl}/api-get-all-branch`,
      filter
    );
  }

  getAllCochesOrByBranch(
    all: boolean,
    coachId: number,
    champName: string
  ): void {
    (
      (all
        ? this.getAllBranches({ title: champName })
        : this.getCoachesByBranch(coachId)) as Observable<Branch[]>
    )
      .pipe(
        switchMap((branches) =>
          of(
            branches.map((b: Branch) => {
              b.isTmanager =
                b.role == Role.tournamentManager && b.details == champName;

              return b as Branch;
            })
          )
        )
      )
      .subscribe((branches: Branch[]) => this.#coaches$.next(branches));
  }

  blockCoach(model: any) {
    return this.http
      .post(`${this.baseUrl}/api-block-coache`, model)
      .toPromise();
  }

  changeTmanagerRole(model: any) {
    return this.http
      .post(`${this.baseUrl}/api-change-role`, model)
      .toPromise();
  }

  getAllCoaches() {
    return this.http.get(`${this.baseUrl}/api-all-coaches`).toPromise();
  }

  getAllCoachClubs() {
    return this.http.get(`${this.baseUrl}/api-all-clubs`).toPromise();
  }
}
