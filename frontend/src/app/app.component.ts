import { Component, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

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
      <mat-sidenav #sidenav [mode]="sidenavMode" [opened]="sidenavOpened" (closed)="onSidenavClosed()">
        <mat-nav-list>
          <a mat-list-item routerLink="/home" (click)="closeSidenavOnMobile()">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/market-data" (click)="closeSidenavOnMobile()">
            <mat-icon>trending_up</mat-icon>
            <span>Market Data</span>
          </a>
          <a mat-list-item routerLink="/analysis" (click)="closeSidenavOnMobile()">
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

    @media (max-width: 768px) {
      mat-toolbar {
        position: sticky;
        top: 0;
        z-index: 1000;
      }

      .container {
        padding: 10px;
      }

      mat-sidenav {
        width: 280px;
      }
    }

    @media (max-width: 480px) {
      .container {
        padding: 8px;
      }

      mat-sidenav {
        width: 100vw;
        max-width: 280px;
      }
    }
  `],
  imports: [
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatButtonModule
  ],
  standalone: true
})
export class AppComponent {
  title = 'Investment Portfolio';
  sidenavMode: 'side' | 'over' = 'side';
  sidenavOpened = true;
  isMobile = false;

  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver.observe([Breakpoints.HandsetPortrait, Breakpoints.TabletPortrait])
      .subscribe(result => {
        this.isMobile = result.matches;
        this.sidenavMode = this.isMobile ? 'over' : 'side';
        this.sidenavOpened = !this.isMobile;
      });
  }

  closeSidenavOnMobile() {
    if (this.isMobile && this.sidenav) {
      this.sidenav.close();
    }
  }

  onSidenavClosed() {
    // Handle any cleanup when sidenav is closed
  }
} 