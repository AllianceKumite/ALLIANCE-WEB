/**
 * @author Ilya
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tournament } from '../interfaces/tournaments';
import { environment } from "../../.././environments/environment";


@Injectable({
  providedIn: 'root'
})

export class BlogService {
    constructor(public http: HttpClient) { }

    getTournaments() {
      // return this.http.get('assets/tournaments.json');
        return this.http.get(`${environment.serverApiUrl}/api-champ-get-all-champs-info`);
    }

}
