import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TournamentService {
  constructor(private http: HttpClient) {}

  getTatamiTime(name) {
    return this.http.post(
      `${environment.serverApiUrl}/api-champ-get-online-tatami-timer`,
      {
        name: name,
      }
    );
  }

  isExistsFile(name) {
    return this.http.post(
      `${environment.serverApiUrl}/api-champ-is-exists-file`,
      {
        name: name,
      }
    );
  }


  setTatamiTime(tatami, time, name) {
    return this.http.post(
      `${environment.serverApiUrl}/api-champ-set-online-tatami-timer`,
      {
        name: name,
        tatami: tatami,
        time: time,
      }
    );
  }

  getChampType(name: string) {
    return this.http.post(`${environment.serverApiUrl}/api-get-type-champ`, {
      title: name,
    });
  }

  getPDFFile(htmlText: string) {
    return this.http.post(`${environment.serverApiUrl}/api-create-pdf-file`, {
      htmlText,
    });
  }

  getCoaches(filter: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-champ-get-coaches`,
      filter
    );
  }

  getClubs(filter: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-champ-get-clubs`,
      filter
    );
  }

  getCategories(filter: any) {
    // console.log('getCategories', filter);
    
    return this.http.post(
      `${environment.serverApiUrl}/api-champ-get-categories-info`,
      filter
    );
  }

  getTotalClubs() {
    return this.http.post(
      `${environment.serverApiUrl}/api-champ-get-all-clubs`,null);
  }

  getCountries(filter: any) {
   
    return this.http.post(
      `${environment.serverApiUrl}/api-champ-get-countries`,
      filter
    );
  }

  getParticipants(filter: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-champ-get-participants`,
      filter
    );
  }

  getParticipantscount(filter: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-champ-get-participants-count`,
      filter
    );
  }

  getReferys(filter: any) {
    return this.http.post(`${environment.serverApiUrl}/api-champ-get-referys`, filter);
  }

  updateReferyBrigade(filter: any) {
    // console.log('api-champ-update-refery-brigade');
    // console.log(filter);
    
    
    return this.http.post(`${environment.serverApiUrl}/api-champ-update-refery-brigade`, filter);
  }

  getReferysCoach(filter: any) {
    return this.http.post(`${environment.serverApiUrl}/api-champ-get-referys-coach`, filter);
  }

  getTatamisCurrentFight(filter: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-champ-get-tatamis-current-fight`,
      filter
    );
  }

  getFightsToManage(filter: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-get-fights-to-manage`,
      filter
    );
  }

  getNextFightsByCoach(filter: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-champ-get-part-next-fight-coach`,
      filter
    );
  }

  getNextFightsByClub(filter: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-champ-get-part-next-fight-club`,
      filter
    );
  }

  getKata(filter: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-get-kata`,
      filter
    );
  }

  getLevelKata(filter: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-get-level-kata`,
      filter
    );
  }

  getTatami(filter: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-champ-get-tatami`,
      filter
    );
  }

  getTatamiUrlVideo(filter: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-champ-get-tatami-urlvideo`,
      filter
    );
  }

  setTatami(model: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-champ-set-tatami`, model );
  }

  selectDataByLevel(model: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-champ-create-virtual-data`, model );
  }

  createCopyChamp(model: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-champ-create-copy-champ-data`, model );
  }

  getAllTatami(filter: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-champ-get-tatami-all`,
      { title: filter }
    );
  }

  getTimesByTatamis(filter: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-champ-get-times-by-tatami`,
      { title: filter }
    );
  }

  getIndividualResults(filter: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-champ-get-individual-results`,
      filter
    );
  }

  getIndividualResultsByClub(filter: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-champ-get-individual-results-club`,
      filter
    );
  }

  getGroupedResults(filter: any) {
   
    return this.http.post(
      `${environment.serverApiUrl}/api-champ-get-${filter.entity}-results`,
      { title: filter.title }
    );
  }

  getSubtimes(name: string) {
    return this.http.post(`${environment.serverApiUrl}/api-get-subtimes`, {
      title: name,
    });
  }

  getCategoriesByFilter(filter, config?) {
    return this.http.post(
      `${environment.serverApiUrl}/api-get-categories-by-filter`,
      { ...filter, saveTime: config?.saveTime }
    );
  }

  // {title, fight, winner, points}
  setFightWinner(fight: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-set-fight-winner`,
      fight
    );
  }

  // {title, fight}
  cancelFights(filter: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-cancel-fights`,
      filter
    );
  }

  // {title, fight} || {title, category}
  postponeFights(filter: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-postpone-fights`,
      filter
    );
  }

  // {title, fight}
  unpostponeFights(filter: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-unpostpone-fights`,
      filter
    );
  }

  // fight, akaShiro, switchers
  updateSwitchers(data: any) {
    return this.http.post(
      `${environment.serverApiUrl}/api-update-switchers`,
      data
    );
  }
}
