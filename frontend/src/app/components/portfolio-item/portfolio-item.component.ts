/**
 * Portfolio Item Component
 * 
 * Purpose: Displays individual portfolio with asset management capabilities
 * Connected to: DashboardComponent as a child component
 * Used by: Dashboard template for displaying portfolio items in the list
 * 
 * Features:
 * - Expandable portfolio display with assets
 * - Asset addition form with stock autocomplete
 * - Asset deletion and portfolio management
 * - Real-time value and allocation calculations
 */

import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Service imports
import { MarketDataService } from '../../core/services/market-data.service';

// Interface imports
import { Portfolio, Asset, SearchResult } from '../../core/interfaces';

@Component({
  selector: 'app-portfolio-item',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatAutocompleteModule,
    MatSnackBarModule
  ],
  template: `
    <mat-expansion-panel class="portfolio-panel">
      <mat-expansion-panel-header>
        <mat-panel-title>
          <strong>{{portfolio.name}}</strong>
        </mat-panel-title>
        <mat-panel-description>
          Value: {{portfolio.totalValue | currency}} • Assets: {{portfolio.assets.length || 0}}
        </mat-panel-description>
      </mat-expansion-panel-header>
      
      <div class="portfolio-details">
        <!-- Asset List -->
        <div class="assets-section" *ngIf="portfolio.assets && portfolio.assets.length > 0; else noAssets">
          <h4>Assets</h4>
          <div class="asset-list">
            <div class="asset-item" *ngFor="let asset of portfolio.assets">
              <div class="asset-info">
                <strong>{{asset.symbol}}</strong> - {{asset.name}}
                <div class="asset-details">
                  <span>Qty: {{asset.quantity}}</span>
                  <span>Price: {{asset.currentPrice | currency}}</span>
                  <span>Value: {{asset.value | currency}}</span>
                  <span>Allocation: {{asset.allocation | number:'1.1-1'}}%</span>
                </div>
              </div>
              <button mat-icon-button color="warn" (click)="onDeleteAsset(asset.id!)">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>
        </div>
        <ng-template #noAssets>
          <div class="no-assets">
            <p>No assets in this portfolio</p>
          </div>
        </ng-template>

        <!-- Add Asset Form -->
        <div class="add-asset-section">
          <button mat-button color="primary" (click)="onToggleAddAsset()" *ngIf="!showAddAsset">
            <mat-icon>add</mat-icon>
            Add Asset
          </button>
          
          <div class="add-asset-form" *ngIf="showAddAsset">
            <div class="asset-form-row">
              <mat-form-field appearance="outline">
                <mat-label>Symbol</mat-label>
                <input 
                  matInput 
                  [(ngModel)]="newAsset.symbol" 
                  (ngModelChange)="onSymbolChange()"
                  [matAutocomplete]="stockAuto">
                <mat-autocomplete #stockAuto="matAutocomplete" (optionSelected)="onStockSelected($event.option.value)">
                  <mat-option *ngFor="let stock of filteredStocks" [value]="stock.symbol">
                    <span><strong>{{stock.symbol}}</strong> - {{stock.name}}</span>
                  </mat-option>
                </mat-autocomplete>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Company Name</mat-label>
                <input matInput [(ngModel)]="newAsset.name">
              </mat-form-field>
            </div>
            <div class="asset-form-row">
              <mat-form-field appearance="outline">
                <mat-label>Quantity</mat-label>
                <input matInput type="number" [(ngModel)]="newAsset.quantity" placeholder="10" min="1">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Current Price</mat-label>
                <input matInput type="number" [(ngModel)]="newAsset.currentPrice" placeholder="150.00" min="0.01" step="0.01">
              </mat-form-field>
            </div>
            <div class="form-actions">
              <button 
                mat-raised-button 
                color="primary" 
                (click)="onAddAsset()"
                [disabled]="!isValidAsset()">
                Add Asset
              </button>
              <button mat-button (click)="onCancelAddAsset()">
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- Portfolio Actions -->
        <div class="portfolio-actions">
          <button 
            mat-icon-button 
            color="warn" 
            (click)="onDeletePortfolio()" 
            title="Delete Portfolio">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      </div>
    </mat-expansion-panel>
  `,
  styles: [`
    .portfolio-panel {
      margin-bottom: 12px;
    }

    .portfolio-details {
      padding: 16px 0;
    }

    .assets-section h4 {
      margin-bottom: 12px;
      color: #333;
    }

    .asset-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .asset-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border-bottom: 1px solid #eee;
    }

    .asset-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .asset-details {
      display: flex;
      gap: 16px;
    }

    .asset-details span {
      font-size: 12px;
      color: #666;
    }

    .no-assets {
      text-align: center;
      color: #666;
      margin: 20px 0;
    }

    .add-asset-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .add-asset-form {
      padding: 16px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #f9f9f9;
      margin-top: 12px;
    }

    .asset-form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .asset-form-row mat-form-field {
      flex: 1;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }

    .portfolio-actions {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
    }

    @media (max-width: 768px) {
      .asset-form-row {
        flex-direction: column;
      }

      .asset-details {
        flex-direction: column;
        gap: 4px;
      }
    }
  `]
})
export class PortfolioItemComponent implements OnInit {
  @Input() portfolio!: Portfolio;
  @Input() showAddAsset: boolean = false;
  @Input() newAsset!: { symbol: string; name: string; quantity: number; currentPrice: number; };
  @Input() filteredStocks: SearchResult[] = [];

  @Output() toggleAddAsset = new EventEmitter<void>();
  @Output() addAsset = new EventEmitter<void>();
  @Output() cancelAddAsset = new EventEmitter<void>();
  @Output() deleteAsset = new EventEmitter<string | number>();
  @Output() deletePortfolio = new EventEmitter<void>();
  @Output() symbolChange = new EventEmitter<void>();
  @Output() stockSelected = new EventEmitter<string>();

  constructor(private marketDataService: MarketDataService) {}

  ngOnInit(): void {
    // Initialize any additional logic if needed
  }

  onToggleAddAsset(): void {
    this.toggleAddAsset.emit();
  }

  onAddAsset(): void {
    if (this.isValidAsset()) {
      this.addAsset.emit();
    }
  }

  onCancelAddAsset(): void {
    this.cancelAddAsset.emit();
  }

  onDeleteAsset(assetId: string | number): void {
    this.deleteAsset.emit(assetId);
  }

  onDeletePortfolio(): void {
    if (confirm('Are you sure you want to delete this portfolio? This will also delete all assets within it.')) {
      this.deletePortfolio.emit();
    }
  }

  onSymbolChange(): void {
    this.symbolChange.emit();
  }

  onStockSelected(symbol: string): void {
    this.stockSelected.emit(symbol);
  }

  isValidAsset(): boolean {
    return !!(
      this.newAsset.symbol?.trim() &&
      this.newAsset.name?.trim() &&
      this.newAsset.quantity > 0 &&
      this.newAsset.currentPrice > 0
    );
  }
} 