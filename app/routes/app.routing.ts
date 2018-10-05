import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from '../components/login/login.component';
import { ForgotPasswordComponent } from '../components/login/forgotPassword/forgotPassword.component';
import { HomeComponent } from '../components/home/home.component';
import { ManagementPanelComponent } from '../components/managementPanel/managementPanel.component';
import { ManagementComponent } from '../components/managementPanel/management/management.component';
import { StatisticsComponent } from '../components/managementPanel/statistics/statistics.component';
import { UserPageComponent } from '../components/userPage/userPage.component';
import { SearchPage } from '../components/searchPage/searchPage.component';
import { PageNotFoundComponent } from '../components/pageNotFound/pageNotFound.component';

import { AuthGuard } from '../guards/auth/auth.guard';
import { RootAuthGuard } from '../guards/rootAuth/rootAuth.guard';
import { LoginGuard } from '../guards/login/login.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'panel', component: ManagementPanelComponent, canActivate: [RootAuthGuard] },
      { path: 'management', component: ManagementComponent, canActivate: [RootAuthGuard] },
      { path: 'statistics', component: StatisticsComponent, canActivate: [RootAuthGuard] },
      { path: 'page-not-found', component: PageNotFoundComponent },
      { path: 'profile/:id', component: UserPageComponent },
      { path: 'search/:name', component: SearchPage }
    ],
    canActivate: [AuthGuard]
  },
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'forgot/:passToken', component: ForgotPasswordComponent },
  { path: '**', redirectTo: 'page-not-found' }
];

export const Routing: ModuleWithProviders = RouterModule.forRoot(routes);