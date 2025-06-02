// this file contains all TypeScript interfaces and types used throughout the application

// AUTHENTICATION INTERFACES

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  username?: string; // Added for backward compatibility
  photoURL?: string;
  emailVerified: boolean;
  createdAt?: Date;
  lastLoginAt?: Date;
  // Legacy fields for backward compatibility
  id?: number;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  displayName?: string;
  // Legacy fields for backward compatibility
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// PORTFOLIO INTERFACES

export interface Portfolio {
  id: string | number; // Allow both for backward compatibility
  firebaseId?: string; // For Firebase document ID
  userId: string | number;
  name: string;
  description?: string;
  assets: Asset[];
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  createdAt: Date | string; // Allow both
  updatedAt: Date | string; // Allow both
  isActive: boolean;
  performance?: PerformanceMetric[]; // Legacy field
}

export interface Asset {
  id: string | number; // Allow both for backward compatibility
  portfolioId: string | number;
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  value?: number; // Legacy field for backward compatibility
  allocation?: number; // Legacy field for percentage allocation
  gainLoss: number;
  gainLossPercentage: number;
  purchaseDate: Date | string; // Allow both
  sector?: string;
  assetType: AssetType;
  lastUpdated: Date | string; // Allow both
}

export enum AssetType {
  STOCK = 'STOCK',
  ETF = 'ETF',
  MUTUAL_FUND = 'MUTUAL_FUND',
  BOND = 'BOND',
  CRYPTO = 'CRYPTO',
  COMMODITY = 'COMMODITY',
  CASH = 'CASH',
  OTHER = 'OTHER'
}

export interface PortfolioSummary {
  id: string;
  name: string;
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  assetCount: number;
  lastUpdated: Date;
}

export interface AssetAllocation {
  sector: string;
  value: number;
  percentage: number;
  color: string;
}

// PERFORMANCE & ANALYTICS INTERFACES

export interface PerformanceMetric {
  portfolioId: string;
  date: Date;
  totalValue: number;
  dailyReturn: number;
  cumulativeReturn: number;
  volatility: number;
  sharpeRatio?: number;
  maxDrawdown?: number;
  // Legacy fields
  id?: number;
  value?: number;
  percentageChange?: number;
}

export interface PortfolioAnalytics {
  portfolioId: string;
  totalReturn: number;
  totalReturnPercentage: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  bestDay: PerformanceDay;
  worstDay: PerformanceDay;
  diversificationScore: number;
  riskLevel: RiskLevel;
  assetAllocation: AssetAllocation[];
  sectorAllocation: AssetAllocation[];
  performanceHistory: PerformanceMetric[];
}

export interface PerformanceDay {
  date: Date;
  return: number;
  returnPercentage: number;
}

export enum RiskLevel {
  VERY_LOW = 'VERY_LOW',
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH'
}

// MARKET DATA INTERFACES

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
  high52Week?: number;
  low52Week?: number;
  lastUpdated: Date | string; // Allow both
  // Legacy fields for backward compatibility
  lastTradeTime?: string;
}

export interface StockInfo {
  symbol: string;
  name: string;
  description?: string;
  sector: string;
  industry: string;
  country: string;
  currency: string;
  exchange: string;
  marketCap?: number;
  peRatio?: number;
  pegRatio?: number;
  dividendYield?: number;
  beta?: number;
  eps?: number;
  high52Week?: number;
  low52Week?: number;
  // Legacy fields for backward compatibility
  currentPrice?: number;
  change?: number;
  changePercent?: number;
  lastUpdated?: Date | string;
}

export interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  marketOpen: string;
  marketClose: string;
  timezone: string;
  currency: string;
  matchScore: number;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  lastUpdated: Date;
}

export interface MarketNews {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: Date | string; // Allow both
  sentiment?: 'positive' | 'negative' | 'neutral';
  relevantSymbols?: string[];
  imageUrl?: string;
  // Legacy fields for backward compatibility
  timePublished?: string;
}

export interface TrendingStock {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  volume: number;
  reason: string; // Why it's trending
}

// API RESPONSE INTERFACES

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: Date;
  path?: string;
}

// UI STATE INTERFACES

export interface LoadingState {
  isLoading: boolean;
  operation?: string;
}

export interface ErrorState {
  hasError: boolean;
  message: string;
  code?: string;
}

export interface UIState {
  loading: LoadingState;
  error: ErrorState;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable: boolean;
  type: 'text' | 'number' | 'currency' | 'percentage' | 'date';
  width?: string;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
}

// UTILITY TYPES

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export interface FilterConfig {
  field: string;
  value: any;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface PriceAlert {
  id: string;
  userId: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

// FORM INTERFACES

export interface PortfolioFormData {
  name: string;
  description?: string;
}

export interface AssetFormData {
  symbol: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: Date;
  assetType: AssetType;
}

export interface UserProfileFormData {
  displayName: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// SEARCH & FILTER INTERFACES

export interface SearchFilters {
  query?: string;
  assetType?: AssetType;
  sector?: string;
  minValue?: number;
  maxValue?: number;
  dateRange?: DateRange;
  sortBy?: string;
  sortDirection?: SortDirection;
}

export interface MarketDataFilters {
  symbols?: string[];
  sector?: string;
  minMarketCap?: number;
  maxMarketCap?: number;
  minPrice?: number;
  maxPrice?: number;
}

// DASHBOARD INTERFACES

export interface DashboardData {
  portfolioSummaries: PortfolioSummary[];
  totalPortfolioValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  topPerformers: Asset[];
  worstPerformers: Asset[];
  recentTransactions: Transaction[];
  marketIndices: MarketIndex[];
  trendingStocks: TrendingStock[];
  marketNews: MarketNews[];
}

export interface Transaction {
  id: string;
  portfolioId: string;
  assetId: string;
  type: 'BUY' | 'SELL';
  symbol: string;
  quantity: number;
  price: number;
  totalAmount: number;
  fees?: number;
  date: Date;
  notes?: string;
}

// TYPE GUARDS & UTILITY FUNCTIONS

// Type guards for runtime type checking
export const isUser = (obj: any): obj is User => {
  return obj && typeof obj.uid === 'string' && typeof obj.email === 'string';
};

export const isPortfolio = (obj: any): obj is Portfolio => {
  return obj && (typeof obj.id === 'string' || typeof obj.id === 'number') && typeof obj.name === 'string' && Array.isArray(obj.assets);
};

export const isAsset = (obj: any): obj is Asset => {
  return obj && typeof obj.symbol === 'string' && typeof obj.quantity === 'number';
};

// UTILITY TYPES FOR OPERATIONS

// Utility type for making all properties optional (for updates)
export type PartialUpdate<T> = Partial<T> & { id: string | number };

// Utility type for creating new entities (without id and timestamps)
export type CreateEntity<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

// Utility type for API responses
export type ApiResult<T> = Promise<ApiResponse<T>>; 