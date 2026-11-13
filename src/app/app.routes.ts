import { Routes } from '@angular/router';
import { CompanyListComponent } from './features/companies/company-list/company-list.component';
import { CompanyRegistrationComponent } from './features/companies/company-registration/company-registration.component';
import { BiDashboardComponent } from './features/dashboard/bi-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: CompanyListComponent },
  { path: 'dashboard', component: BiDashboardComponent },
  { path: 'company-registration', component: CompanyRegistrationComponent },
  { path: 'company-registration/:id', component: CompanyRegistrationComponent },
  { path: '**', redirectTo: '/home' },
];
