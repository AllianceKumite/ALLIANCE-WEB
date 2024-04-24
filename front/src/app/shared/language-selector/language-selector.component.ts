import { Component, OnInit, ViewChild, HostListener, ViewEncapsulation } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { TranslateService } from "@ngx-translate/core";
import { UtilService } from "./../services/util.service";

// TODO
// https://medium.com/@TuiZ/how-to-split-your-i18n-file-per-lazy-loaded-module-with-ngx-translate-3caef57a738f
@Component({
  selector: 'language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LanguageSelectorComponent implements OnInit {
  @ViewChild('languageSelector') languageSelector: NgSelectComponent;
  isVisible;

  isMobileView;
  lng : any;
  DEFAULT_LANGUAGE = "en";

  // TODO: DRY with ../models/language
  languages : any[] = [
    { id: 1, name: 'EN', code: 'en' },
    { id: 2, name: 'RU', code: 'ru' },
    { id: 3, name: 'UA', code: 'ua' },
  ];

  constructor(
      private translateService: TranslateService,
      private utilService: UtilService
  ) { }

  ngOnInit(): void {
      this.isMobileView = window.screen.width < 990;
      // this.translateService.addLangs(['en', 'ua', 'ru']);
      this.lng = localStorage.getItem('lng');

      if (!this.lng) {
          this.lng = this.translateService.getBrowserLang();
          this.lng = this.lng.match(/en|ua|ru/) ? this.lng : this.DEFAULT_LANGUAGE;

          localStorage.setItem('lng', this.lng);
          this.translateService.setDefaultLang(this.lng);
      }

      this.translateService.use(this.lng.toLowerCase());
  }

  @HostListener('window:resize')
  ngDoCheck() {
    if (!this.languageSelector) {
        return;
    }

    let isVisible = ((this.languageSelector.element.children[0]) as HTMLElement).offsetParent !== null;

    if (this.isVisible != isVisible && isVisible && this.lng != localStorage.getItem('lng')) {
        this.lng = localStorage.getItem('lng');
    }
  }

  expand() {
      if (!this.isMobileView) {
          this.languageSelector.open();
      }
  }

  collapse() {
      if (!this.isMobileView) {
          this.languageSelector.close();
      }
  }

  blur() {
    this.languageSelector.blur();
  }

  setLanguage(lng) {
      this.lng = lng;
      localStorage.removeItem('lng');
      localStorage.setItem('lng', lng);

      let champName = this.utilService.getChampNameFromUrl()
      let translationName = champName + (champName != '' ? '-' : '') + lng.toLowerCase()

      this.translateService.use(translationName);
  }
}
