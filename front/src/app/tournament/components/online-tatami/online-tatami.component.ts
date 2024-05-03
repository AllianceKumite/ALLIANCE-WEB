import { Component, HostListener, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { OrderService } from 'src/app/tournament/services/order.service';

@Component({
  selector: 'online-tatami',
  templateUrl: './online-tatami.component.html',
  styleUrls: ['./online-tatami.component.css']
})
export class OnlineTatamiComponent implements OnInit, OnDestroy, OnChanges {
    @Input()
    id: number;

    @Input()
    champType: number;

    @Input()
    fights;

    @Input()
    size: number = -1;

    @Input()
    colorVariant: number = -1;

    @Input()
    champName;

    @Input()
    tatamiType;

    readonly logosDir: string = `${environment.logosDir}`;
   clickEventsubscription: Subscription;
    constructor(
    ) {
    }
  
  ngOnInit(): void {
  }

  ngOnChanges(): void {
  }

  ngOnDestroy(): void {
  }

}
