import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from '../../components/login/login.component';
import { HomeComponent } from '../../components/home/home.component';
import { ManagementPanelComponent } from '../../components/managementPanel/managementPanel.component';
import { ManagementComponent } from '../../components/managementPanel/management/management.component';
import { StatisticsComponent } from '../../components/managementPanel/statistics/statistics.component';
import { UsersReportsComponent } from '../../components/managementPanel/usersReports/usersReports';
import { UserPageComponent } from '../../components/userPage/userPage.component';
import { SearchPageComponent } from '../../components/searchPage/searchPage.component';

import { AuthGuard } from '../../guards/auth/auth.guard';
import { RootAuthGuard } from '../../guards/rootAuth/rootAuth.guard';
import { LoginGuard } from '../../guards/login/login.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'panel', component: ManagementPanelComponent, canActivate: [RootAuthGuard] },
      { path: 'management', component: ManagementComponent, canActivate: [RootAuthGuard] },
      { path: 'management/:id', component: ManagementComponent, canActivate: [RootAuthGuard] },
      { path: 'statistics', component: StatisticsComponent, canActivate: [RootAuthGuard] },
      { path: 'reports', component: UsersReportsComponent, canActivate: [RootAuthGuard] },
      { path: 'profile/:id', component: UserPageComponent },
      { path: 'search/:name', component: SearchPageComponent }
    ],
    canActivate: [AuthGuard]
  },
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'forgot/:passToken', loadChildren: './app/modules/forgotPassword/forgotPassword.module#ForgotPasswordModule' },
  { path: 'delete/:passToken', loadChildren: './app/modules/deleteUser/deleteUser.module#DeleteUserModule' },
  { path: 'page-not-found', loadChildren: './app/modules/pageNotFound/pageNotFound.module#PageNotFoundModule' },
  { path: '**', redirectTo: 'page-not-found' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class Routing { }