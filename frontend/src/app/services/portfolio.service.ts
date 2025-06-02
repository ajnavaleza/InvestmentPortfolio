import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Portfolio {
  id?: number;
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

  // Mock data storage
  private mockPortfolios: Portfolio[] = [
    {
      id: 1,
      totalValue: 15000,
      assets: [
        { id: 1, name: 'Apple Inc.', symbol: 'AAPL', quantity: 50, currentPrice: 150, value: 7500, allocation: 50 },
        { id: 2, name: 'Microsoft', symbol: 'MSFT', quantity: 25, currentPrice: 300, value: 7500, allocation: 50 }
      ],
      performance: []
    },
    {
      id: 2,
      totalValue: 8000,
      assets: [
        { id: 3, name: 'Google', symbol: 'GOOGL', quantity: 10, currentPrice: 800, value: 8000, allocation: 100 }
      ],
      performance: []
    }
  ];

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
    return of([...this.mockPortfolios]).pipe(delay(500));
  }

  private mockGetPortfolioById(id: number): Observable<Portfolio> {
    const portfolio = this.mockPortfolios.find(p => p.id === id);
    console.log('Mock: Getting portfolio by id', id, portfolio);
    return of(portfolio ? { ...portfolio } : {} as Portfolio).pipe(delay(300));
  }

  private mockCreatePortfolio(portfolio: Partial<Portfolio>): Observable<Portfolio> {
    const newPortfolio: Portfolio = {
      id: Math.max(...this.mockPortfolios.map(p => p.id || 0)) + 1,
      totalValue: portfolio.totalValue || 0,
      assets: portfolio.assets || [],
      performance: portfolio.performance || []
    };
    this.mockPortfolios.push(newPortfolio);
    console.log('Mock: Created portfolio', newPortfolio);
    console.log('Mock: All portfolios now', this.mockPortfolios);
    return of({ ...newPortfolio }).pipe(delay(300));
  }

  private mockUpdatePortfolio(id: number, portfolio: Partial<Portfolio>): Observable<Portfolio> {
    const index = this.mockPortfolios.findIndex(p => p.id === id);
    if (index > -1) {
      this.mockPortfolios[index] = { ...this.mockPortfolios[index], ...portfolio };
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
      console.log('Mock: Remaining portfolios', this.mockPortfolios);
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
        id: Math.floor(Math.random() * 10000) + 1,
        name: asset.name!,
        symbol: asset.symbol!,
        quantity: asset.quantity!,
        currentPrice: asset.currentPrice!,
        value: asset.quantity! * asset.currentPrice!,
        allocation: asset.allocation!
      };
      portfolio.assets.push(newAsset);
      portfolio.totalValue += newAsset.value;
      console.log('Mock: Added asset to portfolio', portfolioId, newAsset);
      console.log('Mock: Updated portfolio', portfolio);
      return of({ ...newAsset }).pipe(delay(300));
    }
    return of({} as Asset).pipe(delay(300));
  }

  private mockUpdateAsset(id: number, asset: Partial<Asset>): Observable<Asset> {
    for (let portfolio of this.mockPortfolios) {
      const assetIndex = portfolio.assets.findIndex(a => a.id === id);
      if (assetIndex > -1) {
        const oldValue = portfolio.assets[assetIndex].value;
        portfolio.assets[assetIndex] = { ...portfolio.assets[assetIndex], ...asset };
        // Recalculate value if quantity or price changed
        if (asset.quantity !== undefined || asset.currentPrice !== undefined) {
          portfolio.assets[assetIndex].value = portfolio.assets[assetIndex].quantity * portfolio.assets[assetIndex].currentPrice;
        }
        // Update portfolio total value
        portfolio.totalValue = portfolio.totalValue - oldValue + portfolio.assets[assetIndex].value;
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
        const removedAsset = portfolio.assets.splice(assetIndex, 1)[0];
        portfolio.totalValue -= removedAsset.value;
        console.log('Mock: Deleted asset', id, 'from portfolio', portfolio.id);
        break;
      }
    }
    return of(void 0).pipe(delay(300));
  }
}