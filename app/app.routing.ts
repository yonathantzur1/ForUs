import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { ManagementComponent } from './components/management/management.component';
import { PageNotFoundComponent } from './components/pageNotFound/pageNotFound.component';

import { AuthGuard, AdminAuthGuard } from './auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'management', component: ManagementComponent, canActivate: [AdminAuthGuard] },
      { path: 'page-not-found', component: PageNotFoundComponent }
    ],
    canActivate: [AuthGuard]
  },
  { path: 'login', component: LoginComponent },  
  { path: '**', redirectTo: 'page-not-found' }
];

export const Routing: ModuleWithProviders = RouterModule.forRoot(routes);