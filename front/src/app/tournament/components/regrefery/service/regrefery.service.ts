import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RegreferyService {

  baseUrl: string = environment.serverApiUrl + '/coach';

  constructor(
    private http: HttpClient
    ) { }

  public insertNewRefery(model: any) {
    console.log('insertNewRefery');
    
    return this.http.post(`${this.baseUrl}/api-champ-insert-new-refery`, model);
  }

  public deleteRefery(model: any) {
    return this.http.post(`${this.baseUrl}/api-champ-delete-refery`, model);
  }

  public updateRefery(model: any) {
    return this.http.post(`${this.baseUrl}/api-champ-update-refery-info`, model);
  }

  public updateReferyBrigade(model: any) {
    return this.http.post(`${this.baseUrl}/api-champ-update-refery-brigade`, model);
  }
}
