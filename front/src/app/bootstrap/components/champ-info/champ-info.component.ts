import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'champ-info',
    templateUrl: './champ-info.component.html',
    styleUrls: ['./champ-info.component.css']
})
export class ChampInfoComponent {
    @Input() champName: string = null;
    @Input() champFrom: string = null;
    @Input() champTo: string = null;
}
