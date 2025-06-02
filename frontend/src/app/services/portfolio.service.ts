/**
 * Portfolio Service
 * 
 * Purpose: Manages portfolio and asset data operations with mock backend support
 * Connected to: 
 *   - DashboardComponent for portfolio management
 *   - PortfolioItemComponent for asset operations
 *   - HTTP backend APIs (when useMockBackend is false)
 * Used by: Components needing portfolio CRUD operations
 * 
 * Features:
 * - Portfolio CRUD operations (create, read, update, delete)
 * - Asset management within portfolios
 * - Automatic value and allocation calculations
 * - Mock backend for development/testing
 * - Observable-based async operations
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Portfolio {
  id?: number;
  name?: string;
  totalValue: number;
  assets: Asset[];
  performance: PerformanceMetric[];
}

export interface Asset {
  id?: number;
  name: string;
  symbol: string;
  quantity: number;
  currentPrice: number;
  value: number;
  allocation: number;
}

export interface PerformanceMetric {
  id?: number;
  date: string;
  value: number;
  percentageChange: number;
}

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private apiUrl = `${environment.apiUrl}/portfolios`;
  private assetsUrl = `${environment.apiUrl}/assets`;

  // Start with empty mock data for testing
  private mockPortfolios: Portfolio[] = [];
  private nextPortfolioId = 1;
  private nextAssetId = 1;

  constructor(private http: HttpClient) {}

  // Portfolio CRUD operations
  getAllPortfolios(): Observable<Portfolio[]> {
    if (environment.useMockBackend) {
      return this.mockGetAllPortfolios();
    }
    return this.http.get<Portfolio[]>(this.apiUrl);
  }

  getPortfolioById(id: number): Observable<Portfolio> {
    if (environment.useMockBackend) {
      return this.mockGetPortfolioById(id);
    }
    return this.http.get<Portfolio>(`${this.apiUrl}/${id}`);
  }

  createPortfolio(portfolio: Partial<Portfolio>): Observable<Portfolio> {
    if (environment.useMockBackend) {
      return this.mockCreatePortfolio(portfolio);
    }
    return this.http.post<Portfolio>(this.apiUrl, portfolio);
  }

  updatePortfolio(id: number, portfolio: Partial<Portfolio>): Observable<Portfolio> {
    if (environment.useMockBackend) {
      return this.mockUpdatePortfolio(id, portfolio);
    }
    return this.http.put<Portfolio>(`${this.apiUrl}/${id}`, portfolio);
  }

  deletePortfolio(id: number): Observable<void> {
    if (environment.useMockBackend) {
      return this.mockDeletePortfolio(id);
    }
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Asset operations
  getAssetsByPortfolio(portfolioId: number): Observable<Asset[]> {
    if (environment.useMockBackend) {
      return this.mockGetAssetsByPortfolio(portfolioId);
    }
    return this.http.get<Asset[]>(`${this.assetsUrl}/portfolio/${portfolioId}`);
  }

  addAssetToPortfolio(portfolioId: number, asset: Partial<Asset>): Observable<Asset> {
    if (environment.useMockBackend) {
      return this.mockAddAssetToPortfolio(portfolioId, asset);
    }
    return this.http.post<Asset>(`${this.assetsUrl}/portfolio/${portfolioId}`, asset);
  }

  updateAsset(id: number, asset: Partial<Asset>): Observable<Asset> {
    if (environment.useMockBackend) {
      return this.mockUpdateAsset(id, asset);
    }
    return this.http.put<Asset>(`${this.assetsUrl}/${id}`, asset);
  }

  deleteAsset(id: number): Observable<void> {
    if (environment.useMockBackend) {
      return this.mockDeleteAsset(id);
    }
    return this.http.delete<void>(`${this.assetsUrl}/${id}`);
  }

  // Mock implementations
  private mockGetAllPortfolios(): Observable<Portfolio[]> {
    console.log('Mock: Getting all portfolios', this.mockPortfolios);
    return of([...this.mockPortfolios]).pipe(delay(300));
  }

  private mockGetPortfolioById(id: number): Observable<Portfolio> {
    const portfolio = this.mockPortfolios.find(p => p.id === id);
    console.log('Mock: Getting portfolio by id', id, portfolio);
    return of(portfolio ? { ...portfolio } : {} as Portfolio).pipe(delay(300));
  }

  private mockCreatePortfolio(portfolio: Partial<Portfolio>): Observable<Portfolio> {
    const newPortfolio: Portfolio = {
      id: this.nextPortfolioId++,
      name: portfolio.name || `Portfolio ${this.nextPortfolioId - 1}`,
      totalValue: portfolio.totalValue || 0,
      assets: portfolio.assets || [],
      performance: portfolio.performance || []
    };
    this.mockPortfolios.push(newPortfolio);
    console.log('Mock: Created portfolio', newPortfolio);
    return of({ ...newPortfolio }).pipe(delay(300));
  }

  private mockUpdatePortfolio(id: number, portfolio: Partial<Portfolio>): Observable<Portfolio> {
    const index = this.mockPortfolios.findIndex(p => p.id === id);
    if (index > -1) {
      this.mockPortfolios[index] = { ...this.mockPortfolios[index], ...portfolio };
      // Recalculate total value if assets were updated
      if (portfolio.assets) {
        this.mockPortfolios[index].totalValue = portfolio.assets.reduce((sum, asset) => sum + asset.value, 0);
      }
      console.log('Mock: Updated portfolio', this.mockPortfolios[index]);
      return of({ ...this.mockPortfolios[index] }).pipe(delay(300));
    }
    return of({} as Portfolio).pipe(delay(300));
  }

  private mockDeletePortfolio(id: number): Observable<void> {
    const index = this.mockPortfolios.findIndex(p => p.id === id);
    if (index > -1) {
      this.mockPortfolios.splice(index, 1);
      console.log('Mock: Deleted portfolio', id);
    }
    return of(void 0).pipe(delay(300));
  }

  private mockGetAssetsByPortfolio(portfolioId: number): Observable<Asset[]> {
    const portfolio = this.mockPortfolios.find(p => p.id === portfolioId);
    const assets = portfolio?.assets || [];
    console.log('Mock: Getting assets for portfolio', portfolioId, assets);
    return of([...assets]).pipe(delay(300));
  }

  private mockAddAssetToPortfolio(portfolioId: number, asset: Partial<Asset>): Observable<Asset> {
    const portfolio = this.mockPortfolios.find(p => p.id === portfolioId);
    if (portfolio) {
      const newAsset: Asset = {
        id: this.nextAssetId++,
        name: asset.name!,
        symbol: asset.symbol!,
        quantity: asset.quantity!,
        currentPrice: asset.currentPrice!,
        value: asset.quantity! * asset.currentPrice!,
        allocation: asset.allocation || 0
      };
      portfolio.assets.push(newAsset);
      // Recalculate portfolio total value and allocations
      portfolio.totalValue = portfolio.assets.reduce((sum, a) => sum + a.value, 0);
      this.recalculateAllocations(portfolio);
      console.log('Mock: Added asset to portfolio', portfolioId, newAsset);
      return of({ ...newAsset }).pipe(delay(300));
    }
    return of({} as Asset).pipe(delay(300));
  }

  private mockUpdateAsset(id: number, asset: Partial<Asset>): Observable<Asset> {
    for (let portfolio of this.mockPortfolios) {
      const assetIndex = portfolio.assets.findIndex(a => a.id === id);
      if (assetIndex > -1) {
        portfolio.assets[assetIndex] = { ...portfolio.assets[assetIndex], ...asset };
        // Recalculate value if quantity or price changed
        if (asset.quantity !== undefined || asset.currentPrice !== undefined) {
          portfolio.assets[assetIndex].value = portfolio.assets[assetIndex].quantity * portfolio.assets[assetIndex].currentPrice;
        }
        // Recalculate portfolio total value and allocations
        portfolio.totalValue = portfolio.assets.reduce((sum, a) => sum + a.value, 0);
        this.recalculateAllocations(portfolio);
        console.log('Mock: Updated asset', portfolio.assets[assetIndex]);
        return of({ ...portfolio.assets[assetIndex] }).pipe(delay(300));
      }
    }
    return of({} as Asset).pipe(delay(300));
  }

  private mockDeleteAsset(id: number): Observable<void> {
    for (let portfolio of this.mockPortfolios) {
      const assetIndex = portfolio.assets.findIndex(a => a.id === id);
      if (assetIndex > -1) {
        portfolio.assets.splice(assetIndex, 1);
        // Recalculate portfolio total value and allocations
        portfolio.totalValue = portfolio.assets.reduce((sum, a) => sum + a.value, 0);
        this.recalculateAllocations(portfolio);
        console.log('Mock: Deleted asset', id, 'from portfolio', portfolio.id);
        break;
      }
    }
    return of(void 0).pipe(delay(300));
  }

  private recalculateAllocations(portfolio: Portfolio): void {
    if (portfolio.totalValue > 0) {
      portfolio.assets.forEach(asset => {
        asset.allocation = (asset.value / portfolio.totalValue) * 100;
      });
    } else {
      portfolio.assets.forEach(asset => {
        asset.allocation = 0;
      });
    }
  }
}