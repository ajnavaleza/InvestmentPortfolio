/**
 * Portfolio Form Component
 * 
 * Purpose: Handles portfolio creation with name input and validation
 * Connected to: DashboardComponent as a child component
 * Used by: Dashboard template for creating new portfolios
 * 
 * Features:
 * - Portfolio name input with validation
 * - Create/Cancel actions
 * - Input/Output communication with parent component
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-portfolio-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <div class="create-portfolio-form">
      <mat-form-field appearance="outline" style="width: 100%; margin-bottom: 16px;">
        <mat-label>Portfolio Name</mat-label>
        <input 
          matInput 
           [(ngModel)]="portfolioName" 
           (ngModelChange)="portfolioNameChange.emit($event)"
           maxlength="50">
      </mat-form-field>
      <div class="form-actions">
        <button 
          mat-raised-button 
          color="primary" 
          (click)="onCreate()"
          [disabled]="!portfolioName.trim()">
          Create New Portfolio
        </button>
        <button mat-button (click)="onCancel()">
          Cancel
        </button>
      </div>
    </div>
  `,
  styles: [`
    .create-portfolio-form {
      margin-bottom: 20px;
      padding: 16px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #f9f9f9;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      flex-wrap: wrap;
    }

    /* Mobile Responsive Design */
    @media (max-width: 768px) {
      .create-portfolio-form {
        padding: 12px;
      }

      .form-actions {
        flex-direction: column;
        gap: 8px;
      }

      .form-actions button {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .create-portfolio-form {
        padding: 8px;
      }
    }
  `]
})
export class PortfolioFormComponent {
  @Input() portfolioName: string = '';
  @Output() portfolioNameChange = new EventEmitter<string>();
  @Output() createPortfolio = new EventEmitter<void>();
  @Output() cancelCreate = new EventEmitter<void>();

  onNameChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.portfolioNameChange.emit(target.value);
  }

  onCreate(): void {
    if (this.portfolioName?.trim()) {
      this.createPortfolio.emit();
    }
  }

  onCancel(): void {
    this.cancelCreate.emit();
  }
} 