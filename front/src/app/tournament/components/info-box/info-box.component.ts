import { Component, Input} from '@angular/core';

@Component({
    selector: 'info-box',
    templateUrl: './info-box.component.html',
    styleUrls: ['./info-box.component.css']
})
export class InfoBoxComponent {
    @Input()
    label

    @Input()
    colorVariant

}
