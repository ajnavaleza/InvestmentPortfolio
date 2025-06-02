/**
 * Market Data Service
 * 
 * Purpose: Provides live stock market data and search functionality from Alpha Vantage API
 * Connected to: 
 *   - DashboardComponent for stock autocomplete
 *   - PortfolioItemComponent for asset form auto-completion
 *   - Alpha Vantage API for real-time stock data
 * Used by: Components that need live stock information and search capabilities
 * 
 * Features:
 * - Live stock price lookup from Alpha Vantage
 * - Stock symbol search with real market data
 * - Caching to avoid API rate limits
 * - Error handling for API failures
 * - Fallback to sample data when API is unavailable
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface StockInfo {
  symbol: string;
  name: string;
  currentPrice: number;
  lastUpdated?: string;
  change?: number;
  changePercent?: number;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  lastTradeTime: string;
}

export interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

@Injectable({
  providedIn: 'root'
})
export class MarketDataService {
  private cache = new Map<string, { data: StockInfo; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private isLoading$ = new BehaviorSubject<boolean>(false);
  private lastRequestTime = 0;

  // Fallback sample data for when API is not available
  private sampleStocks: StockInfo[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', currentPrice: 175.50 },
    { symbol: 'MSFT', name: 'Microsoft Corporation', currentPrice: 380.25 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', currentPrice: 140.75 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', currentPrice: 145.20 },
    { symbol: 'TSLA', name: 'Tesla Inc.', currentPrice: 240.80 },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', currentPrice: 850.40 },
    { symbol: 'META', name: 'Meta Platforms Inc.', currentPrice: 485.60 },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', currentPrice: 420.15 },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', currentPrice: 155.30 },
    { symbol: 'V', name: 'Visa Inc.', currentPrice: 285.90 }
  ];

  constructor(private http: HttpClient) {}

  /**
   * Get current loading state
   */
  get isLoading(): Observable<boolean> {
    return this.isLoading$.asObservable();
  }

  /**
   * Get real-time stock information by symbol
   */
  getStockInfo(symbol: string): Observable<StockInfo> {
    // Check cache first
    const cached = this.cache.get(symbol.toUpperCase());
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return of(cached.data);
    }

    // Check if we need to respect rate limiting
    if (!this.canMakeRequest()) {
      const fallback = this.sampleStocks.find(s => s.symbol === symbol.toUpperCase());
      if (fallback) {
        return of(fallback);
      }
      return throwError(() => new Error('Rate limit exceeded and no cached data available'));
    }

    if (!environment.marketData.apiKey || environment.marketData.apiKey === 'YOUR_ALPHA_VANTAGE_API_KEY') {
      // Fallback to sample data if no API key is configured
      const fallback = this.sampleStocks.find(s => s.symbol === symbol.toUpperCase());
      if (fallback) {
        return of(fallback);
      }
      return throwError(() => new Error('API key not configured and stock not found in sample data'));
    }

    this.isLoading$.next(true);
    this.updateLastRequestTime();

    const params = {
      function: 'GLOBAL_QUOTE',
      symbol: symbol.toUpperCase(),
      apikey: environment.marketData.apiKey
    };

    return this.http.get<any>(environment.marketData.baseUrl, { params }).pipe(
      map(response => this.parseGlobalQuote(response, symbol)),
      tap(stockInfo => {
        // Cache the result
        this.cache.set(symbol.toUpperCase(), {
          data: stockInfo,
          timestamp: Date.now()
        });
        this.isLoading$.next(false);
      }),
      catchError(error => {
        this.isLoading$.next(false);
        console.error('Error fetching stock data:', error);
        
        // Try fallback to sample data
        const fallback = this.sampleStocks.find(s => s.symbol === symbol.toUpperCase());
        if (fallback) {
          return of(fallback);
        }
        
        return throwError(() => error);
      })
    );
  }

  /**
   * Search for stocks by symbol or company name
   */
  searchStocks(query: string): Observable<SearchResult[]> {
    if (query.length < 1) {
      return of([]);
    }

    // Check if we need to respect rate limiting
    if (!this.canMakeRequest()) {
      // Use sample data for search
      const filtered = this.sampleStocks
        .filter(stock => 
          stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
          stock.name.toLowerCase().includes(query.toLowerCase())
        )
        .map(stock => ({
          symbol: stock.symbol,
          name: stock.name,
          type: 'Equity',
          region: 'United States',
          currency: 'USD'
        }));
      return of(filtered);
    }

    if (!environment.marketData.apiKey || environment.marketData.apiKey === 'YOUR_ALPHA_VANTAGE_API_KEY') {
      // Fallback to sample data search
      const filtered = this.sampleStocks
        .filter(stock => 
          stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
          stock.name.toLowerCase().includes(query.toLowerCase())
        )
        .map(stock => ({
          symbol: stock.symbol,
          name: stock.name,
          type: 'Equity',
          region: 'United States',
          currency: 'USD'
        }));
      return of(filtered);
    }

    this.isLoading$.next(true);
    this.updateLastRequestTime();

    const params = {
      function: 'SYMBOL_SEARCH',
      keywords: query,
      apikey: environment.marketData.apiKey
    };

    return this.http.get<any>(environment.marketData.baseUrl, { params }).pipe(
      map(response => this.parseSearchResults(response)),
      tap(() => this.isLoading$.next(false)),
      catchError(error => {
        this.isLoading$.next(false);
        console.error('Error searching stocks:', error);
        
        // Fallback to sample data search
        const filtered = this.sampleStocks
          .filter(stock => 
            stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
            stock.name.toLowerCase().includes(query.toLowerCase())
          )
          .map(stock => ({
            symbol: stock.symbol,
            name: stock.name,
            type: 'Equity',
            region: 'United States',
            currency: 'USD'
          }));
        return of(filtered);
      })
    );
  }

  /**
   * Get multiple stock quotes at once
   */
  getMultipleQuotes(symbols: string[]): Observable<StockInfo[]> {
    const requests = symbols.map(symbol => 
      this.getStockInfo(symbol).pipe(
        catchError(error => {
          console.warn(`Failed to get quote for ${symbol}:`, error);
          return of(null);
        })
      )
    );

    return new Observable(observer => {
      Promise.all(requests.map(req => req.toPromise())).then(results => {
        const validResults = results.filter(result => result !== null) as StockInfo[];
        observer.next(validResults);
        observer.complete();
      });
    });
  }

  /**
   * Get all sample stocks (for development/fallback)
   */
  getAllSampleStocks(): StockInfo[] {
    return [...this.sampleStocks];
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Parse Alpha Vantage Global Quote response
   */
  private parseGlobalQuote(response: any, symbol: string): StockInfo {
    if (response['Error Message']) {
      throw new Error(`API Error: ${response['Error Message']}`);
    }

    if (response['Information']) {
      throw new Error(`API Information: ${response['Information']}`);
    }

    const quote = response['Global Quote'];
    if (!quote) {
      throw new Error('Invalid response format from Alpha Vantage API');
    }

    const price = parseFloat(quote['05. price']) || 0;
    const change = parseFloat(quote['09. change']) || 0;
    const changePercent = parseFloat(quote['10. change percent']?.replace('%', '')) || 0;

    return {
      symbol: symbol.toUpperCase(),
      name: quote['01. symbol'] || symbol, // Alpha Vantage doesn't provide company name in this endpoint
      currentPrice: price,
      lastUpdated: quote['07. latest trading day'],
      change: change,
      changePercent: changePercent
    };
  }

  /**
   * Parse Alpha Vantage Symbol Search response
   */
  private parseSearchResults(response: any): SearchResult[] {
    if (response['Error Message']) {
      throw new Error(`API Error: ${response['Error Message']}`);
    }

    if (response['Information']) {
      throw new Error(`API Information: ${response['Information']}`);
    }

    const bestMatches = response['bestMatches'];
    if (!bestMatches || !Array.isArray(bestMatches)) {
      return [];
    }

    return bestMatches.slice(0, 10).map((match: any) => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region'],
      currency: match['8. currency']
    }));
  }

  /**
   * Check if we can make a request based on rate limiting
   */
  private canMakeRequest(): boolean {
    const now = Date.now();
    return (now - this.lastRequestTime) >= environment.marketData.rateLimitMs;
  }

  /**
   * Update the last request time
   */
  private updateLastRequestTime(): void {
    this.lastRequestTime = Date.now();
  }
} 