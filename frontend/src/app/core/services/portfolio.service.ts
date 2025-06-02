import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { FirebaseService } from './firebase.service';
import { Portfolio, Asset, PerformanceMetric, AssetType } from '../interfaces';
import { cleanPortfolioData } from '../utils/data-cleaning.util';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  
  constructor(private firebaseService: FirebaseService) {}

  // Portfolio CRUD Operations
  getAllPortfolios(): Observable<Portfolio[]> {
    if (environment.useFirebase) {
      return this.firebaseService.getPortfolios();
    }
    return of([]);
  }

  getPortfolioById(id: string | number): Observable<Portfolio> {
    return this.getAllPortfolios().pipe(
      map(portfolios => {
        const portfolio = portfolios.find(p => p.id?.toString() === id.toString());
        if (!portfolio) {
          throw new Error(`Portfolio with id ${id} not found`);
        }
        return portfolio;
      })
    );
  }

  createPortfolio(portfolio: Partial<Portfolio>): Observable<Portfolio> {
    if (!environment.useFirebase) {
      return throwError(() => new Error('Firebase not configured'));
    }

    const portfolioData: Omit<Portfolio, 'id'> = {
      name: portfolio.name || 'New Portfolio',
      description: portfolio.description || '',
      totalValue: portfolio.totalValue || 0,
      totalCost: 0,
      totalGainLoss: 0,
      totalGainLossPercentage: 0,
      assets: portfolio.assets || [],
      isActive: true,
      userId: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.firebaseService.createPortfolio(portfolioData);
  }

  updatePortfolio(id: string | number, portfolio: Partial<Portfolio>): Observable<Portfolio> {
    if (!environment.useFirebase) {
      return throwError(() => new Error('Firebase not configured'));
    }

    if (portfolio.assets) {
      portfolio.totalValue = portfolio.assets.reduce((sum, asset) => sum + (asset.currentValue || asset.value || 0), 0);
      this.recalculateAllocations(portfolio as Portfolio);
    }

    return this.firebaseService.updatePortfolio(id.toString(), portfolio);
  }

  deletePortfolio(id: string | number): Observable<void> {
    if (!environment.useFirebase) {
      return throwError(() => new Error('Firebase not configured'));
    }

    return this.firebaseService.deletePortfolio(id.toString());
  }

  // Asset Operations - Main method used by dashboard
  addAsset(portfolioId: string | number, asset: Partial<Asset>): Observable<Portfolio> {
    return this.addAssetToPortfolio(portfolioId, asset);
  }

  addAssetToPortfolio(portfolioId: string | number, asset: Partial<Asset>): Observable<Portfolio> {
    return this.getPortfolioById(portfolioId).pipe(
      switchMap(portfolio => {
        const newAsset: Asset = this.createAssetWithDefaults(asset, portfolioId.toString());
        const updatedAssets = [...portfolio.assets, newAsset];
        const totalValue = updatedAssets.reduce((sum, a) => sum + (a.currentValue || a.value || 0), 0);
        
        const updatedPortfolio: Partial<Portfolio> = {
          assets: updatedAssets,
          totalValue: totalValue
        };

        this.recalculateAllocations(updatedPortfolio as Portfolio);
        const cleanPortfolio = cleanPortfolioData(updatedPortfolio);
        
        return this.updatePortfolio(portfolioId, cleanPortfolio);
      })
    );
  }

  updateAsset(portfolioId: string | number, assetId: string | number, asset: Partial<Asset>): Observable<Portfolio> {
    return this.getPortfolioById(portfolioId).pipe(
      switchMap(portfolio => {
        const assetIndex = portfolio.assets.findIndex(a => a.id?.toString() === assetId.toString());
        if (assetIndex === -1) {
          throw new Error(`Asset with id ${assetId} not found`);
        }

        const updatedAsset = { 
          ...portfolio.assets[assetIndex], 
          ...asset,
          currentValue: (asset.quantity || portfolio.assets[assetIndex].quantity) * 
                       (asset.currentPrice || portfolio.assets[assetIndex].currentPrice),
          value: (asset.quantity || portfolio.assets[assetIndex].quantity) * 
                (asset.currentPrice || portfolio.assets[assetIndex].currentPrice)
        };

        portfolio.assets[assetIndex] = updatedAsset;

        const totalValue = portfolio.assets.reduce((sum, a) => sum + (a.currentValue || a.value || 0), 0);
        const updatedPortfolio: Partial<Portfolio> = {
          ...portfolio,
          totalValue: totalValue
        };

        this.recalculateAllocations(updatedPortfolio as Portfolio);
        return this.updatePortfolio(portfolioId, updatedPortfolio);
      })
    );
  }

  deleteAsset(portfolioId: string | number, assetId: string | number): Observable<Portfolio> {
    return this.getPortfolioById(portfolioId).pipe(
      switchMap(portfolio => {
        const updatedAssets = portfolio.assets.filter(a => a.id?.toString() !== assetId.toString());
        const totalValue = updatedAssets.reduce((sum, a) => sum + (a.currentValue || a.value || 0), 0);
        
        const updatedPortfolio: Partial<Portfolio> = {
          ...portfolio,
          assets: updatedAssets,
          totalValue: totalValue
        };

        this.recalculateAllocations(updatedPortfolio as Portfolio);
        return this.updatePortfolio(portfolioId, updatedPortfolio);
      })
    );
  }

  // Helper Methods
  private createAssetWithDefaults(asset: Partial<Asset>, portfolioId: string): Asset {
    const currentValue = (asset.quantity || 0) * (asset.currentPrice || 0);
    return {
      id: Date.now().toString(),
      portfolioId: portfolioId,
      name: asset.name || '',
      symbol: asset.symbol || '',
      quantity: asset.quantity || 0,
      currentPrice: asset.currentPrice || 0,
      purchasePrice: asset.purchasePrice || asset.currentPrice || 0,
      totalCost: (asset.quantity || 0) * (asset.purchasePrice || asset.currentPrice || 0),
      currentValue: currentValue,
      gainLoss: currentValue - ((asset.quantity || 0) * (asset.purchasePrice || asset.currentPrice || 0)),
      gainLossPercentage: 0,
      value: currentValue, // Legacy field
      allocation: 0, // Legacy field
      purchaseDate: asset.purchaseDate || new Date(),
      assetType: asset.assetType || AssetType.STOCK,
      lastUpdated: new Date()
    };
  }

  private recalculateAllocations(portfolio: Portfolio): void {
    if (portfolio.totalValue > 0) {
      portfolio.assets.forEach(asset => {
        if (asset.allocation !== undefined) {
          asset.allocation = ((asset.currentValue || asset.value || 0) / portfolio.totalValue) * 100;
        }
      });
    } else {
      portfolio.assets.forEach(asset => {
        if (asset.allocation !== undefined) {
          asset.allocation = 0;
        }
      });
    }
  }

  // Sample Data for Demo
  getSamplePortfolio(): Portfolio {
    return {
      id: '1',
      userId: 'sample-user',
      name: 'Sample Portfolio',
      description: 'A sample portfolio for demonstration',
      totalValue: 25000,
      totalCost: 20000,
      totalGainLoss: 5000,
      totalGainLossPercentage: 25,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      assets: [
        {
          id: '1',
          portfolioId: '1',
          symbol: 'AAPL',
          name: 'Apple Inc.',
          quantity: 50,
          currentPrice: 175.50,
          purchasePrice: 150.00,
          totalCost: 7500,
          currentValue: 8775,
          gainLoss: 1275,
          gainLossPercentage: 17,
          value: 8775, // Legacy
          allocation: 35.1, // Legacy
          purchaseDate: new Date(),
          assetType: AssetType.STOCK,
          lastUpdated: new Date()
        },
        {
          id: '2',
          portfolioId: '1',
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          quantity: 25,
          currentPrice: 380.25,
          purchasePrice: 320.00,
          totalCost: 8000,
          currentValue: 9506.25,
          gainLoss: 1506.25,
          gainLossPercentage: 18.8,
          value: 9506.25, // Legacy
          allocation: 38.0, // Legacy
          purchaseDate: new Date(),
          assetType: AssetType.STOCK,
          lastUpdated: new Date()
        },
        {
          id: '3',
          portfolioId: '1',
          symbol: 'GOOGL',
          name: 'Alphabet Inc.',
          quantity: 30,
          currentPrice: 140.75,
          purchasePrice: 120.00,
          totalCost: 3600,
          currentValue: 4222.50,
          gainLoss: 622.50,
          gainLossPercentage: 17.3,
          value: 4222.50, // Legacy
          allocation: 16.9, // Legacy
          purchaseDate: new Date(),
          assetType: AssetType.STOCK,
          lastUpdated: new Date()
        },
        {
          id: '4',
          portfolioId: '1',
          symbol: 'AMZN',
          name: 'Amazon.com Inc.',
          quantity: 17,
          currentPrice: 145.20,
          purchasePrice: 130.00,
          totalCost: 2210,
          currentValue: 2468.40,
          gainLoss: 258.40,
          gainLossPercentage: 11.7,
          value: 2468.40, // Legacy
          allocation: 9.6, // Legacy
          purchaseDate: new Date(),
          assetType: AssetType.STOCK,
          lastUpdated: new Date()
        }
      ],
      performance: [
        {
          portfolioId: '1',
          date: new Date('2023-12-15'),
          totalValue: 25000,
          dailyReturn: 250,
          cumulativeReturn: 5000,
          volatility: 0.15,
          sharpeRatio: 1.2,
          maxDrawdown: 0.05
        }
      ]
    };
  }
} 