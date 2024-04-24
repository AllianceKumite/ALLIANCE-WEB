import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-category-name',
  templateUrl: './category-name.component.html',
  styleUrls: ['./category-name.component.css']
})
export class CategoryNameComponent {
  @Input() id: number | string;
  @Input() uppercase: boolean = false;
  @Input() blockCount: number = 1;
  @Input() block: number = 1;

  getBlockName() {
      return  this.block == 1 ? 'A' :
              this.block == 2 ? 'B' : '';
  }
}
