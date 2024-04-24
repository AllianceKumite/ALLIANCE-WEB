import { EventEmitter, Injectable } from '@angular/core';
export interface KataChangeEvent {
  lang: string;
  translations: any;
}

@Injectable({
  providedIn: 'root'
})

export class SelectedkataService {
  athIdAka              = -1;
  athIdShiro            = -1;
  selectedKataAka       = -1;
  selectedKataShiro     = -1;
  selectedKataNameAka   = '';
  selectedKataNameShiro = '';

  constructor() { }
}
