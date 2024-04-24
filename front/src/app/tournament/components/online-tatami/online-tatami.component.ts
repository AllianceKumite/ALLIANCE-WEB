import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'online-tatami',
  templateUrl: './online-tatami.component.html',
  styleUrls: ['./online-tatami.component.css']
})
export class OnlineTatamiComponent implements OnInit, OnDestroy {
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

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    // clearInterval(this.intervalId);
  }
}
