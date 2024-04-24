import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Participant } from '../models/participant.model';

@Injectable({
  providedIn: 'root'
})
export class OnlineService {
  constructor(private http: HttpClient){
  }

  getOneTatami(name: string, tatamiId: number) {
    return this.http.post(`${environment.serverApiUrl}/api-champ-get-online-tatami-fights`, {'title': name, 'tatami': tatamiId});
  }

  getOnlineAllTatamisFights(name: string, startingTatamiId: number, tatamisAmount: number) {
    return this.http.post(`${environment.serverApiUrl}/api-champ-get-online-all-tatamis-fights`, {'title': name, 'startingTatamiId': startingTatamiId, 'tatamisAmount': tatamisAmount}).toPromise();
  }
}
