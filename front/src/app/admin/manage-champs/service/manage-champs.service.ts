import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable, Subject, BehaviorSubject, of } from "rxjs";
import { share, switchMap, shareReplay, map, debounceTime} from "rxjs/operators";

import { environment } from "./../../../../environments/environment";
import { Champ } from '../models/champ';

@Injectable({
  providedIn: 'root'
})

export class ManageChampsService {
  #baseUrl: string = environment.serverApiUrl;
  #champs$ = new BehaviorSubject<Champ[]>([]);
  #modifyChamps$ = new Subject<{name: string, action: 'add' | 'remove'}>();

  constructor(private http: HttpClient) { }

  public init(): void {
      this.#load();
  }

  #load(): void {
    this.http
        .get<Champ[]>(`${this.#baseUrl}/api-champ-get-all-champs-info`)
        .pipe(
            switchMap( champs => of(Object.values(champs)
                .map((champ: any) => ({
                    name: champ.title,
                    dateFrom: champ.champFrom,
                    dateTo: champ.champTo,
                    city: champ.champCityRu,
                    champType: champ.champType
                })
            )))
        )
        .subscribe( (champs: Champ[]) => this.#champs$.next(champs) );
  }

  public getAllChamps(): Observable<Champ[]> {
      return this.#champs$;
  }

  public getModyfyChamps(): Observable<{name: string, action: "add" | "remove"}> {
      return this.#modifyChamps$
  }

  public createChamp (name: string): void {
      this.http
          .post<Champ>(`${this.#baseUrl}/api-champ`, {'title': name})
          .subscribe( _ => {
              // this.#createdFlag = name
              this.#load()
              this.#modifyChamps$.next({ name, action: "add" })
          })

  }

  public deleteChamp(name: string): void {
      this.http
          .post<Champ>(`${this.#baseUrl}/api-champ-delete`, {'title': name})
          .subscribe( _ => {
              // this.#deletedFlag = name
              this.#load()
              this.#modifyChamps$.next({name, action: "remove" })
          })
  }
}
