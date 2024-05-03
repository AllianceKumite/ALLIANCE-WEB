import { Injectable } from '@angular/core';
// import { Observable } from 'rxjs';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class OrderService {
  public count = new Subject<number>();

  // public count$ = this.count.asObservable();

  public sendClickEvent(count: number) {    
    console.log('sendClickEvent=', count);
    this.count.next(count);
  }

  // getClickEvent(): Observable<any> {
  //   console.log('99999');
    
  //   return this.event$;
  // }


  // constructor() { }
}
