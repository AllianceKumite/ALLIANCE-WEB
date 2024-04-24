
import {TranslateLoader} from '@ngx-translate/core';

import { HttpClient } from '@angular/common/http';
import { Observable , forkJoin} from 'rxjs';
import { map } from 'rxjs/operators';

export class ChampTranslationLoader implements TranslateLoader {
  constructor(private http: HttpClient) {

  }

  getTranslation(lang: string): Observable<any> {
    // Condition satisfies upon page load. com.json is loaded.
    // console.log("getTranslation", lang)
    if (!lang.includes('-')) {
      return this.http.get('/assets/i18n/' + lang + '.json');
    }

    // TODO: investigate - ossibly we need only the '/assets/i18n/champs/' + lang + '.json' request here
    // Both the responses are combined together and a single response is returned
    const arr = lang.split('-');
    return forkJoin(
      this.http.get('/assets/i18n/' + arr[1] + '.json'),
      this.http.get('/assets/i18n/champs/' + lang + '.json'))
      .pipe(map(data => {
        const res = {};
        data.forEach((obj) => {
          Object.assign(res, obj);
        });
        return res;
      }));
  }
}
