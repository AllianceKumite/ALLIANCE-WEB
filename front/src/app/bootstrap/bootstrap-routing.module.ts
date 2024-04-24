import { NgModule } from '@angular/core';
import { Routes, RouterModule, ExtraOptions, PreloadAllModules } from '@angular/router';
import { NotFoundComponent } from '../shared/not-found/not-found.component';


let routes: Routes = [{
      path: '',
      loadChildren: () => import('../landing/app-landing.module').then(m => m.AppLandingModule),
    }, {
      path: '',
      loadChildren: () => import('../admin/admin.module').then(m => m.AdminModule),
    }, {
      path: 'champ/:name',
      loadChildren: () => import('../tournament/tournament.module').then(m => m.TournamentModule),
    }, {
      path: '',
      loadChildren: () => import('../auth/auth.module').then(m => m.AuthModule),
    }, {
      path: '**',
      component: NotFoundComponent
}];

const routerOptions: ExtraOptions = {
    preloadingStrategy: PreloadAllModules,
};


@NgModule({
  imports: [ RouterModule.forRoot(routes, routerOptions) ],
  // imports: [RouterModule.forRoot(routes)],
  exports: [ RouterModule ]
})
export class BootstrapRoutingModule { }
