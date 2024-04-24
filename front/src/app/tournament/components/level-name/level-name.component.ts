import { Component, Input, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-level-name',
  templateUrl: './level-name.component.html',
  styleUrls: ['./level-name.component.css']
})
export class LevelNameComponent implements OnInit {
    @Input() details;
    
    typeOlimp = environment.typeOlimp;
    typeCircle = environment.typeCircle;
    typeKata = environment.typeKata;
    typeWKB = environment.typeWKB;
  
    ngOnInit( ) {
    }
}
