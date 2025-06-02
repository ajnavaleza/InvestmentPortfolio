import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Portfolio, Asset } from './portfolio.service';
import { User, LoginResponse, RegisterResponse } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MockBackendService {
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

  private mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com'
  };

  // Mock Auth Methods
  mockLogin(username: string, password: string): Observable<LoginResponse> {
    return of({
      accessToken: 'mock-jwt-token-12345',
      tokenType: 'Bearer',
      username: username
    }).pipe(delay(500));
  }

  mockRegister(user: User): Observable<RegisterResponse> {
    return of({
      user: { ...user, id: 1 },
      accessToken: 'mock-jwt-token-12345',
      tokenType: 'Bearer'
    }).pipe(delay(500));
  }

  mockGetCurrentUser(): Observable<User> {
    return of(this.mockUser).pipe(delay(300));
  }

  // Mock Portfolio Methods
  mockGetAllPortfolios(): Observable<Portfolio[]> {
    return of(this.mockPortfolios).pipe(delay(500));
  }

  mockGetPortfolioById(id: number): Observable<Portfolio> {
    const portfolio = this.mockPortfolios.find(p => p.id === id);
    return of(portfolio!).pipe(delay(300));
  }

  mockCreatePortfolio(portfolio: Partial<Portfolio>): Observable<Portfolio> {
    const newPortfolio: Portfolio = {
      id: Math.max(...this.mockPortfolios.map(p => p.id!)) + 1,
      totalValue: portfolio.totalValue || 0,
      assets: [],
      performance: []
    };
    this.mockPortfolios.push(newPortfolio);
    return of(newPortfolio).pipe(delay(300));
  }

  mockDeletePortfolio(id: number): Observable<void> {
    const index = this.mockPortfolios.findIndex(p => p.id === id);
    if (index > -1) {
      this.mockPortfolios.splice(index, 1);
    }
    return of(void 0).pipe(delay(300));
  }

  mockGetAssetsByPortfolio(portfolioId: number): Observable<Asset[]> {
    const portfolio = this.mockPortfolios.find(p => p.id === portfolioId);
    return of(portfolio?.assets || []).pipe(delay(300));
  }

  mockAddAssetToPortfolio(portfolioId: number, asset: Partial<Asset>): Observable<Asset> {
    const portfolio = this.mockPortfolios.find(p => p.id === portfolioId);
    if (portfolio) {
      const newAsset: Asset = {
        id: Math.random() * 1000,
        name: asset.name!,
        symbol: asset.symbol!,
        quantity: asset.quantity!,
        currentPrice: asset.currentPrice!,
        value: asset.quantity! * asset.currentPrice!,
        allocation: asset.allocation!
      };
      portfolio.assets.push(newAsset);
      portfolio.totalValue += newAsset.value;
      return of(newAsset).pipe(delay(300));
    }
    return of({} as Asset);
  }
}