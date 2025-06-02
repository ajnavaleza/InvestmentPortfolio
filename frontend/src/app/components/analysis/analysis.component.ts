import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { PortfolioService } from '../../core/services/portfolio.service';
import { Portfolio, Asset } from '../../core/interfaces';
import { AssetType } from '../../core/interfaces';

interface AnalysisData {
  totalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  dayChange: number;
  dayChangePercent: number;
  topPerformer: Asset | null;
  worstPerformer: Asset | null;
  diversificationScore: number;
}

interface AssetAllocation {
  symbol: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface PerformanceMetric {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  description: string;
}

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSnackBarModule,
    FormsModule
  ]
})
export class AnalysisComponent implements OnInit {
  portfolios: Portfolio[] = [];
  selectedPortfolioId: string | number | null = null;
  analysisData: AnalysisData | null = null;
  assetAllocation: AssetAllocation[] = [];
  performanceMetrics: PerformanceMetric[] = [];
  isLoading = false;

  // Chart colors for asset allocation
  private chartColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
    '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
  ];

  constructor(
    private portfolioService: PortfolioService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPortfolios();
  }

  loadPortfolios(): void {
    this.isLoading = true;
    this.portfolioService.getAllPortfolios().subscribe({
      next: (portfolios) => {
        this.portfolios = portfolios;
        if (portfolios.length > 0) {
          this.selectedPortfolioId = portfolios[0].id || null;
          this.analyzePortfolio();
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading portfolios', 'Close', { duration: 3000 });
        this.isLoading = false;
        this.loadSampleAnalysis();
      }
    });
  }

  onPortfolioChange(): void {
    if (this.selectedPortfolioId) {
      this.analyzePortfolio();
    }
  }

  analyzePortfolio(): void {
    if (!this.selectedPortfolioId) return;

    const portfolio = this.portfolios.find(p => p.id === this.selectedPortfolioId);
    if (!portfolio || !portfolio.assets || portfolio.assets.length === 0) {
      this.loadSampleAnalysis();
      return;
    }

    this.calculateAnalysisData(portfolio);
    this.calculateAssetAllocation(portfolio);
    this.calculatePerformanceMetrics(portfolio);
  }

  private calculateAnalysisData(portfolio: Portfolio): void {
    const assets = portfolio.assets;
    const totalValue = assets.reduce((sum, asset) => sum + (asset.quantity * asset.currentPrice), 0);
    
    // Simulate some performance data (in a real app, this would come from historical data)
    const totalReturn = totalValue * 0.08; // 8% return simulation
    const dayChange = totalValue * (Math.random() * 0.04 - 0.02); // Random daily change

    let topPerformer: Asset | null = null;
    let worstPerformer: Asset | null = null;
    
    if (assets.length > 0) {
      topPerformer = assets.reduce((prev, current) => 
        (prev.currentPrice > current.currentPrice) ? prev : current
      );
      worstPerformer = assets.reduce((prev, current) => 
        (prev.currentPrice < current.currentPrice) ? prev : current
      );
    }

    // Simple diversification score based on number of assets and allocation spread
    const diversificationScore = Math.min(100, (assets.length * 15) + 
      (100 - this.calculateConcentrationRisk(assets)));

    this.analysisData = {
      totalValue,
      totalReturn,
      totalReturnPercent: (totalReturn / totalValue) * 100,
      dayChange,
      dayChangePercent: (dayChange / totalValue) * 100,
      topPerformer,
      worstPerformer,
      diversificationScore
    };
  }

  private calculateAssetAllocation(portfolio: Portfolio): void {
    const assets = portfolio.assets;
    const totalValue = assets.reduce((sum, asset) => sum + (asset.quantity * asset.currentPrice), 0);

    this.assetAllocation = assets.map((asset, index) => {
      const value = asset.quantity * asset.currentPrice;
      return {
        symbol: asset.symbol,
        name: asset.name,
        value,
        percentage: (value / totalValue) * 100,
        color: this.chartColors[index % this.chartColors.length]
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }

  private calculatePerformanceMetrics(portfolio: Portfolio): void {
    if (!this.analysisData) return;

    this.performanceMetrics = [
      {
        label: 'Total Return',
        value: `$${this.analysisData.totalReturn.toFixed(2)} (${this.analysisData.totalReturnPercent.toFixed(2)}%)`,
        trend: this.analysisData.totalReturn >= 0 ? 'up' : 'down',
        description: 'Overall portfolio performance since inception'
      },
      {
        label: 'Daily Change',
        value: `$${this.analysisData.dayChange.toFixed(2)} (${this.analysisData.dayChangePercent.toFixed(2)}%)`,
        trend: this.analysisData.dayChange >= 0 ? 'up' : 'down',
        description: 'Portfolio change in the last trading day'
      },
      {
        label: 'Diversification Score',
        value: `${this.analysisData.diversificationScore.toFixed(0)}/100`,
        trend: this.analysisData.diversificationScore >= 70 ? 'up' : 
               this.analysisData.diversificationScore >= 40 ? 'neutral' : 'down',
        description: 'Measure of portfolio diversification and risk distribution'
      },
      {
        label: 'Number of Holdings',
        value: portfolio.assets.length.toString(),
        trend: portfolio.assets.length >= 5 ? 'up' : 'neutral',
        description: 'Total number of different assets in portfolio'
      }
    ];
  }

  private calculateConcentrationRisk(assets: Asset[]): number {
    const totalValue = assets.reduce((sum, asset) => sum + (asset.quantity * asset.currentPrice), 0);
    const maxAllocation = Math.max(...assets.map(asset => 
      (asset.quantity * asset.currentPrice) / totalValue
    )) * 100;
    return maxAllocation;
  }

  private loadSampleAnalysis(): void {
    // Sample data for demonstration
    this.analysisData = {
      totalValue: 125000,
      totalReturn: 10000,
      totalReturnPercent: 8.7,
      dayChange: 520,
      dayChangePercent: 0.42,
      topPerformer: {
        id: '1',
        portfolioId: 'sample-portfolio',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        quantity: 100,
        purchasePrice: 150.00,
        currentPrice: 175.50,
        totalCost: 15000,
        currentValue: 17550,
        gainLoss: 2550,
        gainLossPercentage: 17,
        value: 17550,
        allocation: 28,
        purchaseDate: new Date(),
        assetType: AssetType.STOCK,
        lastUpdated: new Date()
      },
      worstPerformer: {
        id: '2',
        portfolioId: 'sample-portfolio',
        symbol: 'MSFT',
        name: 'Microsoft Corp.',
        quantity: 50,
        purchasePrice: 350.00,
        currentPrice: 380.25,
        totalCost: 17500,
        currentValue: 19012.5,
        gainLoss: 1512.5,
        gainLossPercentage: 8.6,
        value: 19012.5,
        allocation: 24,
        purchaseDate: new Date(),
        assetType: AssetType.STOCK,
        lastUpdated: new Date()
      },
      diversificationScore: 78
    };

    this.assetAllocation = [
      { symbol: 'AAPL', name: 'Apple Inc.', value: 35000, percentage: 28, color: '#FF6384' },
      { symbol: 'MSFT', name: 'Microsoft Corp.', value: 30000, percentage: 24, color: '#36A2EB' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', value: 25000, percentage: 20, color: '#FFCE56' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', value: 20000, percentage: 16, color: '#4BC0C0' },
      { symbol: 'TSLA', name: 'Tesla Inc.', value: 15000, percentage: 12, color: '#9966FF' }
    ];

    this.calculatePerformanceMetrics({ assets: this.assetAllocation } as any);
  }

  refreshAnalysis(): void {
    if (this.selectedPortfolioId) {
      this.analyzePortfolio();
      this.snackBar.open('Analysis refreshed', 'Close', { duration: 2000 });
    }
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      default: return 'trending_flat';
    }
  }

  getTrendColor(trend: string): string {
    switch (trend) {
      case 'up': return 'green';
      case 'down': return 'red';
      default: return 'gray';
    }
  }

  generatePieChartStyle(): string {
    if (this.assetAllocation.length === 0) {
      return 'background: #f0f0f0;';
    }

    let currentAngle = 0;
    const gradientSegments: string[] = [];

    this.assetAllocation.forEach((asset, index) => {
      const startAngle = currentAngle;
      const endAngle = currentAngle + (asset.percentage * 3.6); // Convert percentage to degrees
      
      gradientSegments.push(`${asset.color} ${startAngle}deg ${endAngle}deg`);
      currentAngle = endAngle;
    });

    return `background: conic-gradient(from 0deg, ${gradientSegments.join(', ')});`;
  }
} 