import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { HomeService } from 'src/app/shared/services/home.service';

@Component({
  selector: 'result-individual',
  templateUrl: './result-individual.component.html',
  styleUrls: ['./result-individual.component.css']
})
export class ResultIndividualComponent implements OnInit {
    @Input()
    data;

    @Input()
    champType

    @Input()
    champName;

    dtOptions;
    tatamiType : number;

  constructor(private activeRoute: ActivatedRoute,
              private sanitizer: DomSanitizer,
              private homeService: HomeService,

    ) { }

  ngOnInit(): void {
   

  }
}
