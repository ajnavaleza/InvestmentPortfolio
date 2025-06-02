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
import { PortfolioService, Portfolio, Asset } from '../../services/portfolio.service';
import { AuthService, User } from '../../services/auth.service';
import { MarketDataService, StockInfo, SearchResult } from '../../services/market-data.service';
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
  showAddAsset: { [portfolioId: number]: boolean } = {};
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
    
    // Subscribe to market data loading state
    this.marketDataService.isLoading.subscribe(loading => {
      this.isLoadingMarketData = loading;
    });
  }

  /**
   * Load current authenticated user information
   */
  loadCurrentUser(): void {
    this.authService.currentUser$.subscribe(user=> {
      this.currentUser = user;
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
        this.isLoading = false;
        console.error('Error loading portfolios:', error);
        this.snackBar.open('Error loading portfolios', 'Close', { duration: 3000 });
      }
    });
  }

  /**
   * Extract recent assets from all portfolios for sidebar display
   */
  loadRecentAssets(): void {
    this.recentAssets = [];
    this.portfolios.forEach(portfolio => {
      if (portfolio.assets) {
        this.recentAssets.push(...portfolio.assets);
      }
    });
    this.recentAssets = this.recentAssets.slice(0, 5);
  }

  /**
   * Create a new portfolio with validation
   */
  createPortfolio(): void {
    if (!this.newPortfolioName.trim()) {
      this.snackBar.open('Please enter a portfolio name', 'Close', { duration: 3000 });
      return;
    }

    const portfolio = {
      name: this.newPortfolioName.trim(),
      totalValue: 0
    };

    this.portfolioService.createPortfolio(portfolio).subscribe({
      next: (portfolio) => {
        this.snackBar.open('Portfolio created successfully!', 'Close', { duration: 3000 });
        this.loadPortfolios();
        this.cancelCreatePortfolio();
      },
      error: (error) => {
        console.error('Error creating portfolio:', error);
        this.snackBar.open('Error creating portfolio', 'Close', { duration: 3000 });
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
  toggleAddAsset(portfolioId: number): void {
    this.showAddAsset[portfolioId] = true;
    this.resetNewAsset();
    // Start with some popular stocks for initial display
    this.loadInitialStocks();
  }

  /**
   * Add a new asset to the specified portfolio
   */
  addAsset(portfolioId: number): void {
    if (!this.newAsset.symbol || !this.newAsset.name || this.newAsset.quantity <= 0 || this.newAsset.currentPrice <= 0) {
      this.snackBar.open('Please fill in all asset fields with valid values', 'Close', { duration: 3000 });
      return;
    }

    this.portfolioService.addAssetToPortfolio(portfolioId, this.newAsset).subscribe({
      next: (asset) => {
        this.snackBar.open('Asset added successfully!', 'Close', { duration: 3000 });
        this.loadPortfolios();
        this.cancelAddAsset(portfolioId);
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
  cancelAddAsset(portfolioId: number): void {
    this.showAddAsset[portfolioId] = false;
    this.resetNewAsset();
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
        this.newAsset.currentPrice = stockInfo.currentPrice;
        this.isLoadingMarketData = false;
        
        if (stockInfo.change !== undefined) {
          const changeText = stockInfo.change >= 0 ? '+' : '';
          this.snackBar.open(
            `${stockInfo.symbol}: $${stockInfo.currentPrice} (${changeText}${stockInfo.change?.toFixed(2)})`,
            'Close',
            { duration: 3000 }
          );
        }
      },
      error: (error) => {
        this.isLoadingMarketData = false;
        console.error('Error fetching stock info:', error);
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
  deleteAsset(assetId: number): void {
    this.portfolioService.deleteAsset(assetId).subscribe({
      next: () => {
        this.snackBar.open('Asset deleted successfully!', 'Close', { duration: 3000 });
        this.loadPortfolios();
      },
      error: (error) => {
        console.error('Error deleting asset:', error);
        this.snackBar.open('Error deleting asset', 'Close', { duration: 3000 });
      }
    });
  }

  /**
   * Delete a portfolio by ID
   */
  deletePortfolio(id: number): void {
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

  /**
   * Test API endpoint for portfolio retrieval
   */
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

  /**
   * Test API endpoint for user authentication
   */
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

  /**
   * Refresh all dashboard data
   */
  refreshData(): void {
    this.loadPortfolios();
  }

  /**
   * Log out current user and reload page
   */
  logout(): void {
    this.authService.logout();
    window.location.reload();
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
    this.marketDataService.searchStocks(query).subscribe({
      next: (results) => {
        this.filteredStocks = results.slice(0, 10); // Limit to 10 results
      },
      error: (error) => {
        console.error('Error searching stocks:', error);
        // Keep existing filtered stocks or clear them
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
      currency: 'USD'
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
          `Market Data Test: AAPL = $${stockInfo.currentPrice} (Updated: ${stockInfo.lastUpdated})`,
          'Close',
          { duration: 5000 }
        );
      },
      error: (error) => {
        console.error('Market data test failed:', error);
        this.snackBar.open('Market Data Test Failed: Using fallback data', 'Close', { duration: 3000 });
      }
    });
  }
}