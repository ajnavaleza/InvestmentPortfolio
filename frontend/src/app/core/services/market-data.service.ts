import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, BehaviorSubject, throwError, forkJoin } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StockInfo, StockQuote, SearchResult, MarketNews } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class MarketDataService {
  private cache = new Map<string, { data: StockInfo; timestamp: number }>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private isLoading$ = new BehaviorSubject<boolean>(false);
  private lastRequestTime = 0;
  private readonly apiKey = environment.marketDataApiKey;
  private readonly baseUrl = 'https://www.alphavantage.co/query';

  // Major market indices symbols
  private readonly marketIndices = ['SPY', 'QQQ', 'DIA'];
  private readonly trendingStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA'];

  // Fallback sample data for when API is not available
  private sampleStocks: StockInfo[] = [
    { 
      symbol: 'AAPL', 
      name: 'Apple Inc.', 
      currentPrice: 175.50,
      sector: 'Technology',
      industry: 'Consumer Electronics',
      country: 'USA',
      currency: 'USD',
      exchange: 'NASDAQ'
    },
    { 
      symbol: 'MSFT', 
      name: 'Microsoft Corporation', 
      currentPrice: 380.25,
      sector: 'Technology',
      industry: 'Software',
      country: 'USA',
      currency: 'USD',
      exchange: 'NASDAQ'
    },
    { 
      symbol: 'GOOGL', 
      name: 'Alphabet Inc.', 
      currentPrice: 140.75,
      sector: 'Technology',
      industry: 'Internet',
      country: 'USA',
      currency: 'USD',
      exchange: 'NASDAQ'
    },
    { 
      symbol: 'AMZN', 
      name: 'Amazon.com Inc.', 
      currentPrice: 145.20,
      sector: 'Consumer Cyclical',
      industry: 'E-commerce',
      country: 'USA',
      currency: 'USD',
      exchange: 'NASDAQ'
    },
    { 
      symbol: 'TSLA', 
      name: 'Tesla Inc.', 
      currentPrice: 240.80,
      sector: 'Consumer Cyclical',
      industry: 'Auto Manufacturers',
      country: 'USA',
      currency: 'USD',
      exchange: 'NASDAQ'
    },
    { 
      symbol: 'NVDA', 
      name: 'NVIDIA Corporation', 
      currentPrice: 850.40,
      sector: 'Technology',
      industry: 'Semiconductors',
      country: 'USA',
      currency: 'USD',
      exchange: 'NASDAQ'
    },
    { 
      symbol: 'META', 
      name: 'Meta Platforms Inc.', 
      currentPrice: 485.60,
      sector: 'Technology',
      industry: 'Social Media',
      country: 'USA',
      currency: 'USD',
      exchange: 'NASDAQ'
    },
    { 
      symbol: 'BRK.B', 
      name: 'Berkshire Hathaway Inc.', 
      currentPrice: 420.15,
      sector: 'Financial Services',
      industry: 'Insurance',
      country: 'USA',
      currency: 'USD',
      exchange: 'NYSE'
    },
    { 
      symbol: 'JPM', 
      name: 'JPMorgan Chase & Co.', 
      currentPrice: 155.30,
      sector: 'Financial Services',
      industry: 'Banks',
      country: 'USA',
      currency: 'USD',
      exchange: 'NYSE'
    },
    { 
      symbol: 'V', 
      name: 'Visa Inc.', 
      currentPrice: 285.90,
      sector: 'Financial Services',
      industry: 'Credit Services',
      country: 'USA',
      currency: 'USD',
      exchange: 'NYSE'
    }
  ];

  constructor(private http: HttpClient) {}

  get isLoading(): Observable<boolean> {
    return this.isLoading$.asObservable();
  }

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

    if (!environment.marketDataApiKey || environment.marketDataApiKey === 'your-alpha-vantage-api-key') {
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
      apikey: environment.marketDataApiKey
    };

    return this.http.get<any>(environment.marketDataBaseUrl + '/query', { params }).pipe(
      map(response => this.parseGlobalQuote(response, symbol)),
      tap(stockInfo => {
        this.cache.set(symbol.toUpperCase(), {
          data: stockInfo,
          timestamp: Date.now()
        });
        this.isLoading$.next(false);
      }),
      catchError(error => {
        this.isLoading$.next(false);
        const fallback = this.sampleStocks.find(s => s.symbol === symbol.toUpperCase());
        if (fallback) {
          return of(fallback);
        }
        return throwError(() => error);
      })
    );
  }

  searchStocks(query: string): Observable<StockQuote> {
    return this.http.get(`${this.baseUrl}?function=SYMBOL_SEARCH&keywords=${query}&apikey=${this.apiKey}`)
      .pipe(
        switchMap((response: any) => {
          if (!response.bestMatches || response.bestMatches.length === 0) {
            throw new Error('No matching stocks found');
          }
          const bestMatch = response.bestMatches[0];
          return this.getQuote(bestMatch['1. symbol']);
        }),
        catchError(error => {
          const sampleStock = this.sampleStocks.find(s => 
            s.symbol.toLowerCase() === query.toLowerCase() ||
            s.name.toLowerCase().includes(query.toLowerCase())
          );
          if (sampleStock) {
            return of({
              symbol: sampleStock.symbol,
              name: sampleStock.name,
              price: sampleStock.currentPrice || 0,
              change: 0,
              changePercent: 0,
              volume: 0,
              lastUpdated: new Date(),
              lastTradeTime: new Date().toISOString()
            });
          }
          throw error;
        })
      );
  }

  getMultipleQuotes(symbols: string[]): Observable<StockInfo[]> {
    const requests = symbols.map(symbol => 
      this.getStockInfo(symbol).pipe(
        catchError(() => of(null))
      )
    );

    return forkJoin(requests).pipe(
      map(results => results.filter(result => result !== null) as StockInfo[])
    );
  }

  getAllSampleStocks(): StockInfo[] {
    return [...this.sampleStocks];
  }

  clearCache(): void {
    this.cache.clear();
  }

  getMarketIndices(): Observable<StockQuote[]> {
    return this.getMultipleQuotes(this.marketIndices).pipe(
      map(stocks => stocks.map(stock => this.stockInfoToQuote(stock)))
    );
  }

  getTrendingStocks(): Observable<StockQuote[]> {
    return this.getMultipleQuotes(this.trendingStocks).pipe(
      map(stocks => stocks.map(stock => this.stockInfoToQuote(stock)))
    );
  }

  getQuote(symbol: string): Observable<StockQuote> {
    if (!this.canMakeRequest()) {
      const fallback = this.sampleStocks.find(s => s.symbol === symbol.toUpperCase());
      if (fallback) {
        return of(this.stockInfoToQuote(fallback));
      }
      return throwError(() => new Error('Rate limit exceeded'));
    }

    this.updateLastRequestTime();

    const params = {
      function: 'GLOBAL_QUOTE',
      symbol: symbol.toUpperCase(),
      apikey: this.apiKey
    };

    return this.http.get<any>(`${this.baseUrl}`, { params }).pipe(
      map(response => {
        const quote = response['Global Quote'];
        if (!quote) {
          throw new Error('No Global Quote in response');
        }

        return {
          symbol: quote['01. symbol'],
          name: quote['01. symbol'], // Use symbol as name if name not available
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          volume: parseInt(quote['06. volume']),
          lastUpdated: new Date(quote['07. latest trading day']),
          lastTradeTime: quote['07. latest trading day']
        };
      }),
      catchError(error => {
        const fallback = this.sampleStocks.find(s => s.symbol === symbol.toUpperCase());
        if (fallback) {
          return of(this.stockInfoToQuote(fallback));
        }
        return throwError(() => error);
      })
    );
  }

  getMarketNews(): Observable<MarketNews[]> {
    const params = {
      function: 'NEWS_SENTIMENT',
      apikey: this.apiKey,
      limit: '10'
    };

    return this.http.get<any>(`${this.baseUrl}`, { params }).pipe(
      map(response => {
        if (!response.feed) {
          return [];
        }
        return response.feed.slice(0, 10).map((item: any) => ({
          title: item.title,
          url: item.url,
          source: item.source,
          summary: item.summary,
          timePublished: item.time_published
        }));
      }),
      catchError(() => of([]))
    );
  }

  searchStocksBasic(query: string): Observable<SearchResult[]> {
    const params = {
      function: 'SYMBOL_SEARCH',
      keywords: query,
      apikey: this.apiKey
    };

    return this.http.get<any>(`${this.baseUrl}`, { params }).pipe(
      map(response => {
        if (!response.bestMatches) {
          return [];
        }
        return response.bestMatches.slice(0, 10).map((match: any) => ({
          symbol: match['1. symbol'],
          name: match['2. name'],
          type: match['3. type'],
          region: match['4. region'],
          currency: match['8. currency']
        }));
      }),
      catchError(() => of([]))
    );
  }

  // Private helper methods
  private parseGlobalQuote(response: any, symbol: string): StockInfo {
    const quote = response['Global Quote'];
    if (!quote) {
      throw new Error('Invalid API response format');
    }

    const sampleStock = this.sampleStocks.find(s => s.symbol === symbol.toUpperCase());
    
    return {
      symbol: quote['01. symbol'] || symbol.toUpperCase(),
      name: sampleStock?.name || symbol.toUpperCase(),
      sector: sampleStock?.sector || 'Unknown',
      industry: sampleStock?.industry || 'Unknown',
      country: sampleStock?.country || 'USA',
      currency: sampleStock?.currency || 'USD',
      exchange: sampleStock?.exchange || 'NASDAQ',
      currentPrice: parseFloat(quote['05. price']) || 0,
      lastUpdated: quote['07. latest trading day'],
      change: parseFloat(quote['09. change']) || 0,
      changePercent: parseFloat(quote['10. change percent']?.replace('%', '')) || 0
    };
  }

  private canMakeRequest(): boolean {
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    return timeSinceLastRequest >= 12000; // 12 seconds between requests (5 requests per minute)
  }

  private updateLastRequestTime(): void {
    this.lastRequestTime = Date.now();
  }

  private stockInfoToQuote(stock: StockInfo): StockQuote {
    return {
      symbol: stock.symbol,
      name: stock.name,
      price: stock.currentPrice || 0,
      change: stock.change || 0,
      changePercent: stock.changePercent || 0,
      volume: 0,
      lastUpdated: typeof stock.lastUpdated === 'string' ? new Date(stock.lastUpdated) : (stock.lastUpdated || new Date()),
      lastTradeTime: typeof stock.lastUpdated === 'string' ? stock.lastUpdated : (stock.lastUpdated?.toISOString() || new Date().toISOString())
    };
  }
} 