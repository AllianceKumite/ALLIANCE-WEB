import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../../src/environments/environment";

@Injectable({
    providedIn: 'root'
  })
  export class CategoryService {
    constructor(private http: HttpClient){
    }

    getDrawSvg(name: string, lng: string, catName: string) {
        return this.http.post(`${environment.serverApiUrl}/api-champ-get-draw-by-categories`, {'title': name, "lng": lng, 'catTitle': catName});
    }

    getDrawData(name: string, catName: string) {
       return (this.http.post(`${environment.serverApiUrl}/api-champ-get-data-for-draw-by-categories`, {'title': name, 'catTitle': catName}));
    }
  }
