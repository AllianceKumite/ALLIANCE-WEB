import { NgModule }                     from '@angular/core';
import { HttpClient }                   from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader }          from '@ngx-translate/http-loader';
import { DefaultUrlSerializer, UrlTree, UrlSerializer } from '@angular/router';
import { SharedModule }                 from './../shared/shared.module'

import { AdminRoutingModule }           from './admin-routing.module';
import { ManageParticipantsComponent }  from './manage-participants/ui/manage-participants.component'
import { ManageChampsComponent }        from './manage-champs/ui/manage-champs.component';
import { ManageInstructorsComponent } from './manage-participants/ui/manage-instructors/manage-instructors/manage-instructors.component'
import { PaginationModule, PaginationConfig } from 'ngx-bootstrap/pagination';
// import { MatInputModule } from '@angular/material/input';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatTableModule } from '@angular/material/table';
// import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}


class LowerCaseUrlSerializer extends DefaultUrlSerializer {
    parse(url: string): UrlTree {
        return super.parse(url.toLowerCase());
    }
}


@NgModule({
  declarations: [
    ManageParticipantsComponent,
    ManageChampsComponent,
    ManageInstructorsComponent,
  ],
  imports: [
    SharedModule,
    AdminRoutingModule,
    PaginationModule,

    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      // ,extend: true
    }),
  ],
  providers: [
    {
      provide: UrlSerializer,
      useClass: LowerCaseUrlSerializer,
    },
    PaginationConfig,
  ],
})
export class AdminModule {}
