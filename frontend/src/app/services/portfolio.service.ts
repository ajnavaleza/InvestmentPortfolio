import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  constructor(private http: HttpClient) {}

  // Portfolio CRUD operations
  getAllPortfolios(): Observable<Portfolio[]> {
    return this.http.get<Portfolio[]>(this.apiUrl);
  }

  getPortfolioById(id: number): Observable<Portfolio> {
    return this.http.get<Portfolio>(`${this.apiUrl}/${id}`);
  }

  createPortfolio(portfolio: Partial<Portfolio>): Observable<Portfolio> {
    return this.http.post<Portfolio>(this.apiUrl, portfolio);
  }

  updatePortfolio(id: number, portfolio: Partial<Portfolio>): Observable<Portfolio> {
    return this.http.put<Portfolio>(`${this.apiUrl}/${id}`, portfolio);
  }

  deletePortfolio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Asset operations
  getAssetsByPortfolio(portfolioId: number): Observable<Asset[]> {
    return this.http.get<Asset[]>(`${this.assetsUrl}/portfolio/${portfolioId}`);
  }

  addAssetToPortfolio(portfolioId: number, asset: Partial<Asset>): Observable<Asset> {
    return this.http.post<Asset>(`${this.assetsUrl}/portfolio/${portfolioId}`, asset);
  }

  updateAsset(id: number, asset: Partial<Asset>): Observable<Asset> {
    return this.http.put<Asset>(`${this.assetsUrl}/${id}`, asset);
  }

  deleteAsset(id: number): Observable<void> {
    return this.http.delete<void>(`${this.assetsUrl}/${id}`);
  }
}