import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { 
    path: 'login',
    loadComponent: () => import('./components/dashboard/login.component')
      .then(m => m.LoginComponent)
  },
  { 
    path: 'register',
    loadComponent: () => import('./components/auth/register.component')
      .then(m => m.RegisterComponent)
  },
  { 
    path: 'home',
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'market-data',
    loadComponent: () => import('./components/market-data/market-data.component')
      .then(m => m.MarketDataComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'analysis',
    loadComponent: () => import('./components/analysis/analysis.component')
      .then(m => m.AnalysisComponent),
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }