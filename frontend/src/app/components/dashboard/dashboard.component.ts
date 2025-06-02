import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PortfolioService, Portfolio, Asset } from '../../services/portfolio.service';
import { AuthService, User } from '../../services/auth.service';
import { MockBackendService } from 'src/app/services/mock-backend.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule, 
    MatCardModule, 
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Portfolio Dashboard</h1>
        <div class="user-info" *ngIf="currentUser">
          <span>Welcome, {{currentUser.username}}!</span>
          <button mat-button (click)="logout()" color="warn">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </div>
      </div>
      
      <div class="stats-row">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-value">{{portfolios.length}}</div>
              <div class="stat-label">Total Portfolios</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-value">{{getTotalValue() | currency}}</div>
              <div class="stat-label">Total Value</div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-value">{{getTotalAssets()}}</div>
              <div class="stat-label">Total Assets</div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-grid-list cols="2" rowHeight="400px" gutterSize="16">
        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>Portfolios</mat-card-title>
              <button mat-button color="primary" (click)="mockCreatePortfolio()">
                <mat-icon>add</mat-icon>
                Create Test Portfolio
              </button>
            </mat-card-header>
            <mat-card-content>
              <div class="portfolio-list" *ngIf="portfolios.length > 0; else noPortfolios">
                <div class="portfolio-item" *ngFor="let portfolio of portfolios">
                  <div class="portfolio-info">
                    <strong>Portfolio #{{portfolio.id}}</strong>
                    <span>Value: {{portfolio.totalValue | currency}}</span>
                    <span>Assets: {{portfolio.assets?.length || 0}}</span>
                  </div>
                  <button mat-icon-button color="warn" (click)="deletePortfolio(portfolio.id!)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
              <ng-template #noPortfolios>
                <div class="placeholder-content">
                  <p>No portfolios found</p>
                  <button mat-raised-button color="primary" (click)="createTestPortfolio()">
                    Create Your First Portfolio
                  </button>
                </div>
              </ng-template>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>Recent Assets</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="asset-list" *ngIf="recentAssets.length > 0; else noAssets">
                <div class="asset-item" *ngFor="let asset of recentAssets">
                  <div class="asset-info">
                    <strong>{{asset.symbol}}</strong>
                    <span>{{asset.name}}</span>
                    <span>Qty: {{asset.quantity}} | Price: {{asset.currentPrice | currency}}</span>
                  </div>
                </div>
              </div>
              <ng-template #noAssets>
                <div class="placeholder-content">
                  <p>No assets found</p>
                </div>
              </ng-template>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <mat-grid-tile colspan="2">
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>API Test Actions</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="test-actions">
                <button mat-raised-button color="primary" (click)="testGetPortfolios()">
                  Test Get Portfolios
                </button>
                <button mat-raised-button color="accent" (click)="testGetCurrentUser()">
                  Test Get Current User
                </button>
                <button mat-raised-button (click)="refreshData()">
                  <mat-icon>refresh</mat-icon>
                  Refresh Data
                </button>
              </div>
              <div class="loading-indicator" *ngIf="isLoading">
                Loading...
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
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .stats-row {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      flex: 1;
      min-height: 100px;
    }

    .stat-content {
      text-align: center;
    }

    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #1976d2;
    }

    .stat-label {
      color: #666;
      margin-top: 5px;
    }

    .dashboard-card {
      width: 100%;
      height: 100%;
    }

    .portfolio-list, .asset-list {
      max-height: 280px;
      overflow-y: auto;
    }

    .portfolio-item, .asset-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border-bottom: 1px solid #eee;
    }

    .portfolio-info, .asset-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .portfolio-info span, .asset-info span {
      font-size: 12px;
      color: #666;
    }

    .placeholder-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: #666;
      gap: 20px;
    }

    .test-actions {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }

    .loading-indicator {
      text-align: center;
      color: #666;
      font-style: italic;
    }

    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  `]
})
export class DashboardComponent implements OnInit {
  portfolios: Portfolio[] = [];
  recentAssets: Asset[] = [];
  currentUser: User | null = null;
  isLoading = false;

  constructor(
    private portfolioService: PortfolioService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private mockBackend: MockBackendService
  ) {}

  mockCreatePortfolio(): void {
    this.mockBackend.mockCreatePortfolio({
      totalValue: 10000,
      assets: []
    }).subscribe(portfolio => {
      console.log('Created mock portfolio:', portfolio);
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadPortfolios();
  }

  loadCurrentUser(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadPortfolios(): void {
    this.isLoading = true;
    this.portfolioService.getAllPortfolios().subscribe({
      next: (portfolios) => {
        this.portfolios = portfolios;
        this.loadRecentAssets();
        this.isLoading = false;
        console.log('Loaded portfolios:', portfolios);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading portfolios:', error);
        this.snackBar.open('Error loading portfolios', 'Close', { duration: 3000 });
      }
    });
  }

  loadRecentAssets(): void {
    // Load assets from the first portfolio if available
    if (this.portfolios.length > 0) {
      const firstPortfolio = this.portfolios[0];
      if (firstPortfolio.id) {
        this.portfolioService.getAssetsByPortfolio(firstPortfolio.id).subscribe({
          next: (assets) => {
            this.recentAssets = assets.slice(0, 5); // Show only first 5
            console.log('Loaded recent assets:', assets);
          },
          error: (error) => {
            console.error('Error loading assets:', error);
          }
        });
      }
    }
  }

  createTestPortfolio(): void {
    const testPortfolio = {
      totalValue: 0
    };

    this.portfolioService.createPortfolio(testPortfolio).subscribe({
      next: (portfolio) => {
        this.snackBar.open('Test portfolio created successfully!', 'Close', { duration: 3000 });
        this.addTestAssetToPortfolio(portfolio.id!);
        this.loadPortfolios();
      },
      error: (error) => {
        console.error('Error creating portfolio:', error);
        this.snackBar.open('Error creating portfolio', 'Close', { duration: 3000 });
      }
    });
  }

  addTestAssetToPortfolio(portfolioId: number): void {
    const testAsset = {
      name: 'Apple Inc.',
      symbol: 'AAPL',
      quantity: 10,
      currentPrice: 150.00,
      allocation: 100
    };

    this.portfolioService.addAssetToPortfolio(portfolioId, testAsset).subscribe({
      next: (asset) => {
        console.log('Test asset added:', asset);
        this.loadPortfolios();
      },
      error: (error) => {
        console.error('Error adding test asset:', error);
      }
    });
  }

  deletePortfolio(id: number): void {
    if (confirm('Are you sure you want to delete this portfolio?')) {
      this.portfolioService.deletePortfolio(id).subscribe({
        next: () => {
          this.snackBar.open('Portfolio deleted successfully!', 'Close', { duration: 3000 });
          this.loadPortfolios();
        },
        error: (error) => {
          console.error('Error deleting portfolio:', error);
          this.snackBar.open('Error deleting portfolio', 'Close', { duration: 3000 });
        }
      });
    }
  }

  testGetPortfolios(): void {
    this.portfolioService.getAllPortfolios().subscribe({
      next: (portfolios) => {
        console.log('Test - Get Portfolios Response:', portfolios);
        this.snackBar.open(`API Test: Found ${portfolios.length} portfolios`, 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Test - Get Portfolios Error:', error);
        this.snackBar.open('API Test Failed: Check console for details', 'Close', { duration: 3000 });
      }
    });
  }

  testGetCurrentUser(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        console.log('Test - Get Current User Response:', user);
        this.snackBar.open(`API Test: Current user is ${user.username}`, 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Test - Get Current User Error:', error);
        this.snackBar.open('API Test Failed: Check console for details', 'Close', { duration: 3000 });
      }
    });
  }

  refreshData(): void {
    this.loadPortfolios();
  }

  logout(): void {
    this.authService.logout();
    window.location.reload();
  }

  getTotalValue(): number {
    return this.portfolios.reduce((total, portfolio) => total + (portfolio.totalValue || 0), 0);
  }

  getTotalAssets(): number {
    return this.portfolios.reduce((total, portfolio) => total + (portfolio.assets?.length || 0), 0);
  }
}