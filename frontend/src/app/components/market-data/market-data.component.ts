import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { MarketDataService } from '../../core/services/market-data.service';
import { StockQuote, MarketNews } from '../../core/interfaces';

@Component({
  selector: 'app-market-data',
  templateUrl: './market-data.component.html',
  styleUrls: ['./market-data.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule
  ]
})
export class MarketDataComponent implements OnInit {
  searchQuery: string = '';
  marketIndices: StockQuote[] = [];
  trendingStocks: StockQuote[] = [];
  marketNews: MarketNews[] = [];
  searchResult: StockQuote | null = null;
  loading = {
    indices: false,
    trending: false,
    news: false,
    search: false
  };
  error = {
    indices: '',
    trending: '',
    news: '',
    search: ''
  };

  constructor(
    private marketDataService: MarketDataService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadMarketData();
  }

  loadMarketData(): void {
    // Load market indices
    this.loading.indices = true;
    this.marketDataService.getMarketIndices().subscribe({
      next: (data) => {
        this.marketIndices = data;
        this.loading.indices = false;
      },
      error: (err) => {
        this.error.indices = 'Failed to load live data, using sample data';
        this.loading.indices = false;
        
        // Load sample indices data
        this.marketIndices = [
          { 
            symbol: 'SPY', 
            name: 'SPDR S&P 500',
            price: 450.25, 
            change: 2.50, 
            changePercent: 0.56, 
            volume: 1000000, 
            lastUpdated: new Date()
          },
          { 
            symbol: 'QQQ', 
            name: 'Invesco QQQ',
            price: 380.75, 
            change: -1.25, 
            changePercent: -0.33, 
            volume: 800000, 
            lastUpdated: new Date()
          },
          { 
            symbol: 'DIA', 
            name: 'SPDR Dow Jones',
            price: 340.80, 
            change: 0.80, 
            changePercent: 0.24, 
            volume: 600000, 
            lastUpdated: new Date()
          }
        ];
      }
    });

    // Load trending stocks
    this.loading.trending = true;
    this.marketDataService.getTrendingStocks().subscribe({
      next: (data) => {
        this.trendingStocks = data;
        this.loading.trending = false;
      },
      error: (err) => {
        this.error.trending = 'Failed to load live data, using sample data';
        this.loading.trending = false;
        
        // Load sample trending stocks
        this.trendingStocks = [
          { 
            symbol: 'AAPL', 
            name: 'Apple Inc.',
            price: 175.50, 
            change: 2.30, 
            changePercent: 1.33, 
            volume: 2000000, 
            lastUpdated: new Date()
          },
          { 
            symbol: 'MSFT', 
            name: 'Microsoft Corporation',
            price: 380.25, 
            change: -1.80, 
            changePercent: -0.47, 
            volume: 1500000, 
            lastUpdated: new Date()
          },
          { 
            symbol: 'GOOGL', 
            name: 'Alphabet Inc.',
            price: 140.75, 
            change: 3.20, 
            changePercent: 2.32, 
            volume: 1200000, 
            lastUpdated: new Date()
          },
          { 
            symbol: 'AMZN', 
            name: 'Amazon.com Inc.',
            price: 145.20, 
            change: 0.85, 
            changePercent: 0.59, 
            volume: 900000, 
            lastUpdated: new Date()
          },
          { 
            symbol: 'NVDA', 
            name: 'NVIDIA Corporation',
            price: 850.40, 
            change: 15.60, 
            changePercent: 1.87, 
            volume: 3000000, 
            lastUpdated: new Date()
          }
        ];
      }
    });

    // Load market news
    this.loading.news = true;
    this.marketDataService.getMarketNews().subscribe({
      next: (data) => {
        this.marketNews = data;
        this.loading.news = false;
      },
      error: (err) => {
        this.error.news = 'Failed to load live news, using sample data';
        this.loading.news = false;
        
        // Load sample news
        this.marketNews = [
          {
            id: '1',
            title: 'Tech Stocks Show Mixed Performance in Morning Trading',
            url: '#',
            source: 'Sample Financial News',
            summary: 'Technology stocks are showing mixed results as investors weigh earnings reports and economic indicators.',
            publishedAt: new Date(),
            timePublished: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Federal Reserve Signals Continued Monetary Policy',
            url: '#',
            source: 'Sample Economics Report',
            summary: 'The Federal Reserve continues to monitor inflation indicators while maintaining current interest rate policies.',
            publishedAt: new Date(Date.now() - 3600000),
            timePublished: new Date(Date.now() - 3600000).toISOString()
          }
        ];
      }
    });
  }

  searchStocks(): void {
    if (!this.searchQuery.trim()) return;

    this.loading.search = true;
    this.searchResult = null;
    this.error.search = '';

    this.marketDataService.searchStocks(this.searchQuery).subscribe({
      next: (data) => {
        this.searchResult = data;
        this.loading.search = false;
      },
      error: (err) => {
        this.error.search = err.message || 'Failed to find stock. Please try another symbol.';
        this.loading.search = false;
      }
    });
  }

  testApiConnection(): void {
    this.snackBar.open('Testing API connection...', 'Close', { duration: 2000 });
    
    // First test the service's ability to get sample data
    const sampleStocks = this.marketDataService.getAllSampleStocks();
    if (sampleStocks.length > 0) {
      this.snackBar.open('Sample data available, testing live API...', 'Close', { duration: 2000 });
    }

    // Test with a well-known stock
    this.marketDataService.getQuote('AAPL').subscribe({
      next: (data) => {
        this.snackBar.open(
          `API Test Successful! AAPL: $${this.formatPrice(data.price)} (${this.formatChange(data.change, data.changePercent)})`,
          'Close',
          { duration: 5000 }
        );
      },
      error: (err) => {
        let errorMessage = 'API Test Failed: ';
        
        if (err.status === 0) {
          errorMessage += 'CORS error - API calls blocked by browser. Consider using a backend proxy.';
        } else if (err.status === 403 || err.status === 401) {
          errorMessage += 'Invalid API key or access denied.';
        } else if (err.status === 429) {
          errorMessage += 'Rate limit exceeded. Please wait before testing again.';
        } else if (err.error && err.error['Error Message']) {
          errorMessage += err.error['Error Message'];
        } else {
          errorMessage += `HTTP ${err.status}: ${err.message || 'Unknown error'}`;
        }
        
        this.snackBar.open(errorMessage, 'Close', { duration: 8000 });
        
        // Try fallback with sample data
        this.testSampleData();
      }
    });
  }

  private testSampleData(): void {
    setTimeout(() => {
      this.snackBar.open('Falling back to sample data for demonstration...', 'Close', { duration: 3000 });
      
      // Load sample data for testing
      const sampleIndices = [
        { 
          symbol: 'SPY', 
          name: 'SPDR S&P 500',
          price: 450.25, 
          change: 2.50, 
          changePercent: 0.56,
          volume: 1000000,
          lastUpdated: new Date()
        },
        { 
          symbol: 'QQQ', 
          name: 'Invesco QQQ',
          price: 380.75, 
          change: -1.25, 
          changePercent: -0.33,
          volume: 800000,
          lastUpdated: new Date()
        },
        { 
          symbol: 'DIA', 
          name: 'SPDR Dow Jones',
          price: 340.80, 
          change: 0.80, 
          changePercent: 0.24,
          volume: 600000,
          lastUpdated: new Date()
        }
      ];
      
      this.marketIndices = sampleIndices;
      this.loading.indices = false;
      this.error.indices = '';
      
      this.snackBar.open('Sample market data loaded successfully!', 'Close', { duration: 3000 });
    }, 2000);
  }

  getChangeColor(change: number): string {
    return change >= 0 ? 'green' : 'red';
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  formatChange(change: number, changePercent: number): string {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  }
} 