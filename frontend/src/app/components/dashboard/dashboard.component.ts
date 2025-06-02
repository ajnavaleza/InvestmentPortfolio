/**
 * Dashboard Component
 * 
 * Purpose: Main dashboard controller for portfolio management application
 * Connected to: 
 *   - PortfolioService for data operations
 *   - AuthService for user authentication
 *   - MarketDataService for stock information
 *   - Child components: PortfolioFormComponent, PortfolioItemComponent
 * Used by: App routing system as the primary authenticated view
 * 
 * Features:
 * - Portfolio overview with statistics
 * - Portfolio creation and management
 * - Asset management with real-time calculations
 * - User authentication status
 * - API testing utilities
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PortfolioService } from '../../core/services/portfolio.service';
import { AuthService } from '../../core/services/auth.service';
import { MarketDataService } from '../../core/services/market-data.service';
import { Portfolio, Asset, User, StockInfo, SearchResult } from '../../core/interfaces';
import { PortfolioFormComponent } from '../portfolio-form/portfolio-form.component';
import { PortfolioItemComponent } from '../portfolio-item/portfolio-item.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule, 
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatExpansionModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    PortfolioFormComponent,
    PortfolioItemComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Portfolio data
  portfolios: Portfolio[] = [];
  recentAssets: Asset[] = [];
  currentUser: User | null = null;
  isLoading = false;
  
  // UI state management
  showCreatePortfolio = false;
  newPortfolioName = '';
  showAddAsset: { [portfolioId: string]: boolean } = {};
  newAsset = {
    symbol: '',
    name: '',
    quantity: 0,
    currentPrice: 0
  };
  
  // Market data for autocomplete
  filteredStocks: SearchResult[] = [];
  isLoadingMarketData = false;

  constructor(
    private portfolioService: PortfolioService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private marketDataService: MarketDataService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadPortfolios();
    this.loadInitialStocks();
    
    // Subscribe to market data loading state
    this.marketDataService.isLoading.subscribe(loading => {
      this.isLoadingMarketData = loading;
    });
  }

  /**
   * Load current authenticated user information
   */
  loadCurrentUser(): void {
    console.log('Dashboard: Loading current user...');
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        console.log('Dashboard: Current user loaded:', user);
        console.log('Dashboard: User UID:', user.uid);
        console.log('Dashboard: User structure:', JSON.stringify(user, null, 2));
        this.currentUser = user;
      },
      error: (error) => {
        console.error('Dashboard: Error loading current user:', error);
      }
    });
  }

  /**
   * Load all portfolios and update recent assets
   */
  loadPortfolios(): void {
    this.isLoading = true;
    this.portfolioService.getAllPortfolios().subscribe({
      next: (portfolios) => {
        this.portfolios = portfolios;
        this.loadRecentAssets();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading portfolios:', error);
        this.snackBar.open('Error loading portfolios', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  /**
   * Extract recent assets from all portfolios for sidebar display
   */
  loadRecentAssets(): void {
    this.recentAssets = [];
    this.portfolios.forEach(portfolio => {
      if (portfolio.assets && portfolio.assets.length > 0) {
        // Get the last 3 assets from each portfolio
        const lastAssets = portfolio.assets.slice(-3);
        this.recentAssets = [...this.recentAssets, ...lastAssets];
      }
    });
  }

  /**
   * Log out current user
   */
  logout(): void {
    console.log('Dashboard: Starting logout process...');
    this.authService.logout().subscribe({
      next: () => {
        console.log('Dashboard: Logout successful');
        this.snackBar.open('Logged out successfully', 'Close', { duration: 2000 });
        // Don't reload page - let router handle navigation
      },
      error: (error) => {
        console.error('Dashboard: Logout error:', error);
        this.snackBar.open('Logout failed, but clearing local data', 'Close', { duration: 3000 });
        // Still redirect to login even if logout fails
        window.location.href = '/login';
      }
    });
  }

  /**
   * Create a new portfolio with validation
   */
  createPortfolio(): void {
    if (!this.newPortfolioName.trim()) {
      this.snackBar.open('Please enter a portfolio name', 'Close', { duration: 3000 });
      return;
    }

    console.log('Creating portfolio for user:', this.currentUser);

    const portfolioData = {
      name: this.newPortfolioName,
      description: `Portfolio created on ${new Date().toLocaleDateString()}`
    };

    this.portfolioService.createPortfolio(portfolioData).subscribe({
      next: (portfolio) => {
        console.log('Portfolio created successfully:', portfolio);
        this.snackBar.open('Portfolio created successfully!', 'Close', { duration: 3000 });
        this.portfolios.push(portfolio);
        this.newPortfolioName = '';
        this.showCreatePortfolio = false;
      },
      error: (error) => {
        console.error('Error creating portfolio:', error);
        if (error.message === 'User not authenticated') {
          this.snackBar.open('Authentication required. Please log in again.', 'Login', { 
            duration: 5000 
          }).onAction().subscribe(() => {
            this.logout();
          });
        } else {
          this.snackBar.open('Error creating portfolio: ' + (error.message || 'Unknown error'), 'Close', { 
            duration: 5000 
          });
        }
      }
    });
  }

  /**
   * Cancel portfolio creation and reset form
   */
  cancelCreatePortfolio(): void {
    this.showCreatePortfolio = false;
    this.newPortfolioName = '';
  }

  /**
   * Initialize asset addition for a specific portfolio
   */
  toggleAddAsset(portfolioId: string | number): void {
    const id = portfolioId.toString();
    this.showAddAsset[id] = !this.showAddAsset[id];
    if (this.showAddAsset[id]) {
      this.resetNewAsset();
    }
  }

  /**
   * Add a new asset to the specified portfolio
   */
  addAsset(portfolioId: string | number): void {
    const id = portfolioId.toString();
    if (!this.newAsset.symbol || this.newAsset.quantity <= 0 || this.newAsset.currentPrice <= 0) {
      this.snackBar.open('Please fill in all asset details', 'Close', { duration: 3000 });
      return;
    }

    this.portfolioService.addAsset(id, this.newAsset).subscribe({
      next: () => {
        this.snackBar.open('Asset added successfully!', 'Close', { duration: 3000 });
        this.loadPortfolios();
        this.resetNewAsset();
        this.showAddAsset[id] = false;
      },
      error: (error) => {
        console.error('Error adding asset:', error);
        this.snackBar.open('Error adding asset', 'Close', { duration: 3000 });
      }
    });
  }

  /**
   * Cancel asset addition for a specific portfolio
   */
  cancelAddAsset(portfolioId: string | number): void {
    const id = portfolioId.toString();
    this.resetNewAsset();
    this.showAddAsset[id] = false;
  }

  /**
   * Reset the new asset form to default values
   */
  resetNewAsset(): void {
    this.newAsset = {
      symbol: '',
      name: '',
      quantity: 0,
      currentPrice: 0
    };
    this.filteredStocks = [];
  }

  /**
   * Handle stock symbol input changes for autocomplete with live data
   */
  onSymbolChange(): void {
    if (this.newAsset.symbol.length > 0) {
      this.searchLiveStocks(this.newAsset.symbol);
    } else {
      this.loadInitialStocks();
    }
  }

  /**
   * Handle stock selection from autocomplete with live price lookup
   */
  onStockSelected(symbol: string): void {
    this.isLoadingMarketData = true;
    
    this.marketDataService.getStockInfo(symbol).subscribe({
      next: (stockInfo) => {
        this.newAsset.symbol = stockInfo.symbol;
        this.newAsset.name = stockInfo.name;
        this.newAsset.currentPrice = stockInfo.currentPrice || 0;
        this.isLoadingMarketData = false;
        
        if (stockInfo.change !== undefined) {
          const changeText = stockInfo.change >= 0 ? '+' : '';
          this.snackBar.open(
            `${stockInfo.symbol}: $${stockInfo.currentPrice || 0} (${changeText}${stockInfo.change?.toFixed(2)})`,
            'Close',
            { duration: 3000 }
          );
        }
      },
      error: (error) => {
        this.isLoadingMarketData = false;
        this.snackBar.open('Failed to load live stock data, using cached info', 'Close', { duration: 3000 });
        
        // Try to find in filtered stocks for basic info
        const selected = this.filteredStocks.find(stock => stock.symbol === symbol);
        if (selected) {
          this.newAsset.symbol = selected.symbol;
          this.newAsset.name = selected.name;
          // Keep existing price or set to 0 for manual entry
          if (this.newAsset.currentPrice === 0) {
            this.newAsset.currentPrice = 0;
          }
        }
      }
    });
  }

  /**
   * Delete an asset by ID
   */
  deleteAsset(portfolioId: string | number, assetId: string | number): void {
    this.portfolioService.deleteAsset(portfolioId.toString(), assetId.toString()).subscribe({
      next: () => {
        this.snackBar.open('Asset deleted successfully!', 'Close', { duration: 3000 });
        this.loadPortfolios();
      },
      error: (error) => {
        this.snackBar.open('Error deleting asset', 'Close', { duration: 3000 });
      }
    });
  }

  /**
   * Delete a portfolio by ID
   */
  deletePortfolio(id: string | number): void {
    this.portfolioService.deletePortfolio(id.toString()).subscribe({
      next: () => {
        this.snackBar.open('Portfolio deleted successfully!', 'Close', { duration: 3000 });
        this.loadPortfolios();
      },
      error: (error) => {
        this.snackBar.open('Error deleting portfolio', 'Close', { duration: 3000 });
      }
    });
  }

  /**
   * Test API endpoint for portfolio retrieval
   */
  testGetPortfolios(): void {
    this.portfolioService.getAllPortfolios().subscribe({
      next: (portfolios) => {
        this.snackBar.open(`API Test: Found ${portfolios.length} portfolios`, 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('API Test Failed: Check console for details', 'Close', { duration: 3000 });
      }
    });
  }

  /**
   * Test API endpoint for user authentication
   */
  testGetCurrentUser(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.snackBar.open(`API Test: Current user is ${user.displayName || user.email}`, 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('API Test Failed: Check console for details', 'Close', { duration: 3000 });
      }
    });
  }

  /**
   * Refresh all dashboard data
   */
  refreshData(): void {
    this.loadPortfolios();
  }

  /**
   * Calculate total value across all portfolios
   */
  getTotalValue(): number {
    return this.portfolios.reduce((total, portfolio) => total + (portfolio.totalValue || 0), 0);
  }

  /**
   * Calculate total number of assets across all portfolios
   */
  getTotalAssets(): number {
    return this.portfolios.reduce((total, portfolio) => total + (portfolio.assets.length || 0), 0);
  }

  /**
   * Search for live stocks using the market data service
   */
  private searchLiveStocks(query: string): void {
    this.marketDataService.searchStocksBasic(query).subscribe({
      next: (results) => {
        this.filteredStocks = results;
      },
      error: (error) => {
        this.filteredStocks = [];
      }
    });
  }

  /**
   * Load initial popular stocks for display
   */
  private loadInitialStocks(): void {
    // Use sample stocks for initial display to avoid unnecessary API calls
    const sampleStocks = this.marketDataService.getAllSampleStocks();
    this.filteredStocks = sampleStocks.slice(0, 5).map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      type: 'Equity',
      region: 'United States',
      currency: 'USD',
      marketOpen: '09:30',
      marketClose: '16:00',
      timezone: 'EST',
      matchScore: 1.0
    }));
  }

  /**
   * Test real-time market data connection
   */
  testMarketDataConnection(): void {
    this.snackBar.open('Testing market data connection...', 'Close', { duration: 2000 });
    
    this.marketDataService.getStockInfo('AAPL').subscribe({
      next: (stockInfo) => {
        this.snackBar.open(
          `Market Data Test: AAPL = $${stockInfo.currentPrice || 0} (Updated: ${stockInfo.lastUpdated || 'N/A'})`,
          'Close',
          { duration: 5000 }
        );
      },
      error: (error) => {
        this.snackBar.open('Market Data Test Failed: Using fallback data', 'Close', { duration: 3000 });
      }
    });
  }
}