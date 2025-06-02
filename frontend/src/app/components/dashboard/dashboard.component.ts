import { Component, OnInit } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatGridListModule, MatCardModule],
  template: `
    <div class="dashboard-container">
      <h1>Portfolio Dashboard</h1>
      
      <mat-grid-list cols="2" rowHeight="350px" gutterSize="16">
        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>Portfolio Overview</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <!-- Portfolio chart will go here -->
              <div class="chart-placeholder">
                Portfolio Performance Chart
              </div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>Asset Allocation</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <!-- Asset allocation chart will go here -->
              <div class="chart-placeholder">
                Asset Allocation Chart
              </div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>Recent Transactions</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <!-- Transaction list will go here -->
              <div class="placeholder-list">
                <p>No recent transactions</p>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>Market Summary</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <!-- Market summary will go here -->
              <div class="placeholder-list">
                <p>Loading market data...</p>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>
      </mat-grid-list>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }

    .dashboard-card {
      width: 100%;
      height: 100%;
    }

    .chart-placeholder {
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .placeholder-list {
      padding: 16px;
      text-align: center;
      color: #666;
    }
  `]
})
export class DashboardComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    // Initialize dashboard data
  }
} 