import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar color="primary">
      <button mat-icon-button (click)="sidenav.toggle()">
        <mat-icon>menu</mat-icon>
      </button>
      <span>Investment Portfolio</span>
    </mat-toolbar>

    <mat-sidenav-container>
      <mat-sidenav #sidenav mode="side" opened>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/portfolio">
            <mat-icon>account_balance</mat-icon>
            <span>Portfolio</span>
          </a>
          <a mat-list-item routerLink="/market-data">
            <mat-icon>trending_up</mat-icon>
            <span>Market Data</span>
          </a>
          <a mat-list-item routerLink="/analysis">
            <mat-icon>assessment</mat-icon>
            <span>Analysis</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <div class="container">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    mat-sidenav-container {
      height: calc(100vh - 64px);
    }

    mat-sidenav {
      width: 250px;
      padding: 16px;
    }

    .mat-icon {
      margin-right: 8px;
    }

    .container {
      padding: 20px;
    }
  `]
})
export class AppComponent {
  title = 'Investment Portfolio';
} 