import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  constructor() { }

  getChampNameFromUrl(url?: string): string {
    let champName = ''

    if (typeof url == "undefined") {
      url = window.location + '';
    }

    let champPos =  url.indexOf("/champ/");

    if (champPos > -1) {
      champPos += '/champ/'.length;
      let champEndPos = url.indexOf("/", champPos);

      if (champEndPos == -1) {
        champEndPos = url.length
      }

      champName = url.substring(champPos, champEndPos)
    }

    return champName
  }
}
