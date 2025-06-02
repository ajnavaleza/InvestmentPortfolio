import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Portfolio {
  totalValue: number;
  assets: Asset[];
  performance: PerformanceMetric[];
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  quantity: number;
  currentPrice: number;
  value: number;
  allocation: number;
}

export interface PerformanceMetric {
  date: string;
  value: number;
  change: number;
}

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private apiUrl = `${environment.apiUrl}/portfolio`;

  constructor(private http: HttpClient) {}

  // Get portfolio summary
  getPortfolioSummary(): Observable<Portfolio> {
    // TODO: Replace with actual API call
    return of({
      totalValue: 100000,
      assets: [
        {
          id: '1',
          name: 'Apple Inc.',
          symbol: 'AAPL',
          quantity: 100,
          currentPrice: 150,
          value: 15000,
          allocation: 15
        },
        {
          id: '2',
          name: 'Microsoft Corporation',
          symbol: 'MSFT',
          quantity: 50,
          currentPrice: 300,
          value: 15000,
          allocation: 15
        }
      ],
      performance: [
        {
          date: '2024-01-01',
          value: 95000,
          change: -5
        },
        {
          date: '2024-02-01',
          value: 100000,
          change: 5.26
        }
      ]
    });
  }

  // Add more portfolio-related methods here
} 