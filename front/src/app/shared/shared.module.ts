
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DataTablesModule } from 'angular-datatables';


import { LanguageSelectorComponent } from './language-selector/language-selector.component';
import { NotFoundComponent } from './not-found/not-found.component';

import { Routes, RouterModule, Resolve } from '@angular/router';

@NgModule({
  imports: [
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    LanguageSelectorComponent,
    NotFoundComponent
  ],
  exports: [
      CommonModule,
      NgSelectModule,
      FontAwesomeModule,
      DataTablesModule,
      FormsModule,
      ReactiveFormsModule,
      RouterModule,
      LanguageSelectorComponent,
      NotFoundComponent
  ]
})
export class SharedModule { }

