/**
 * @author Ilya
 */
import { NgModule }                from '@angular/core';
import { HttpClient }              from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader }     from '@ngx-translate/http-loader';
import { DefaultUrlSerializer, UrlTree, UrlSerializer } from '@angular/router';
import { SharedModule }            from './../shared/shared.module'
import { CarouselModule }          from 'ngx-bootstrap/carousel';
// import { NgbModule }               from '@ng-bootstrap/ng-bootstrap';
import { PaginationModule,PaginationConfig } from 'ngx-bootstrap/pagination';

import { AppLandingRoutingModule } from './app-landing-routing.module';
import { AppLandingComponent }     from './app-landing.component';

import { HeaderComponent }         from './components/header/header.component';
import { FooterComponent }         from './components/footer/footer.component';
import { LandingComponent }        from './components/landing/landing.component';
import { SliderComponent }         from './components/slider/slider.component';
import { BlogComponent }           from './components/blog/blog.component';
import { TournamentComponent }     from './components/blog/tournament/tournament.component';
import { TopTournamentComponent }  from './components/blog/top-tournament/top-tournament.component';
import { TournamentByIdComponent } from './components/blog/tournament-by-id/tournament-by-id.component';

import { NgOptimizedImage } from '@angular/common';

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
        AppLandingComponent,
        HeaderComponent,
        FooterComponent,
        LandingComponent,
        SliderComponent,
        BlogComponent,
        TournamentComponent,
        TopTournamentComponent,
        TournamentByIdComponent,
    ],
    imports: [
        SharedModule,
        AppLandingRoutingModule,
        PaginationModule,
        NgOptimizedImage,
        CarouselModule.forRoot(),
        TranslateModule.forChild({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            },
            extend: true
        })
    ],
    providers: [{
        provide: UrlSerializer,
        useClass: LowerCaseUrlSerializer
      },
      PaginationConfig
    ]
})
export class AppLandingModule { }
