import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { ManagementComponent } from './components/management/management.component';
import { UserPageComponent } from './components/userPage/userPage.component';
import { PageNotFoundComponent } from './components/pageNotFound/pageNotFound.component';

import { AuthGuard, AdminAuthGuard, LoginGuard } from './auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'management', component: ManagementComponent, canActivate: [AdminAuthGuard] },
      { path: 'page-not-found', component: PageNotFoundComponent },
      { path: 'profile/:id', component: UserPageComponent }
    ],
    canActivate: [AuthGuard]
  },
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: '**', redirectTo: 'page-not-found' }
];

export const Routing: ModuleWithProviders = RouterModule.forRoot(routes);