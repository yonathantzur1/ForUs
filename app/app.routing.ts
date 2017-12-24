import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { ManagementComponent } from './components/management/management.component';
import { PageNotFoundComponent } from './components/pageNotFound/pageNotFound.component';

import { AuthGuard, AdminAuthGuard } from './auth/auth.guard';

const appRoutes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: 'management', component: ManagementComponent, canActivate: [AdminAuthGuard] }
    ],
    canActivate: [AuthGuard]
  },
  { path: 'login', component: LoginComponent },

  { path: '**', component: PageNotFoundComponent }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
