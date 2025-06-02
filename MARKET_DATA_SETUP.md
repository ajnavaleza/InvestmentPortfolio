# Market Data API Setup Guide

## Overview
Your Investment Portfolio application now supports real-time market data through the Alpha Vantage API. This guide will help you set up live stock prices and search functionality.

## Quick Setup

### 1. Get Your Free Alpha Vantage API Key

1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Fill out the form with:
   - Your email address
   - First and last name
   - Organization (can be "Personal Use")
   - Brief description of your intended use
3. Click "GET FREE API KEY"
4. You'll receive your API key immediately on the page and via email

### 2. Configure Your Application

1. Open `frontend/src/environments/environment.ts`
2. Replace `'YOUR_ALPHA_VANTAGE_API_KEY'` with your actual API key:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  useMockBackend: true,
  marketData: {
    provider: 'alphavantage',
    apiKey: 'ABCD1234EFGH5678', // Your actual API key here
    baseUrl: 'https://www.alphavantage.co/query',
    rateLimitMs: 12000 // Free tier: 5 requests per minute
  }
};
```

3. **Important**: Also update `frontend/src/environments/environment.prod.ts` for production

### 3. Test Your Connection

1. Start your application: `ng serve`
2. Go to the dashboard
3. Click "Test Market Data API" button
4. You should see live AAPL stock price data

## Features Available

### 🚀 **Real-Time Stock Data**
- Live stock prices updated from Alpha Vantage
- Price change indicators (+/- and percentages)
- Last trading day information
- 5-minute caching to avoid rate limits

### 🔍 **Live Stock Search**
- Search thousands of stocks by symbol or company name
- Auto-complete with real company names
- Automatic price lookup when selecting stocks
- Support for US equities, ETFs, and more

### 📊 **Smart Caching**
- 5-minute cache for stock prices
- Rate limiting protection (5 requests/minute for free tier)
- Automatic fallback to sample data if API is unavailable
- Loading indicators for better UX

### 🛡️ **Error Handling**
- Graceful fallback to sample data if API fails
- User-friendly error messages
- Automatic retry mechanisms
- No app crashes from API issues

## API Rate Limits

### Free Tier Limits:
- **5 API calls per minute**
- **500 API calls per day**
- Rate limiting built into the service (12 seconds between requests)

### Upgrade Options:
- **Standard ($49.99/month)**: 75 calls/minute, 75,000 calls/month
- **Professional ($149.99/month)**: 150 calls/minute, 150,000 calls/month
- **Enterprise ($599.99/month)**: 600 calls/minute, 600,000 calls/month

## How It Works

### When Adding Assets:

1. **Type a stock symbol** (e.g., "AAPL")
2. **Live search** shows matching companies from Alpha Vantage
3. **Select a stock** to automatically fill:
   - Company name
   - Current market price
   - Live price change data
4. **Enter quantity** and create your asset

### Behind the Scenes:

1. **Symbol Search**: Uses Alpha Vantage's `SYMBOL_SEARCH` function
2. **Price Lookup**: Uses `GLOBAL_QUOTE` function for real-time prices
3. **Caching**: Stores recent data to minimize API calls
4. **Fallback**: Uses sample data if API is unavailable

## Troubleshooting

### "API key not configured" Error
- Make sure you replaced `YOUR_ALPHA_VANTAGE_API_KEY` with your actual key
- Check both `environment.ts` and `environment.prod.ts`
- Restart your development server after making changes

### "Rate limit exceeded" Message
- Free tier allows 5 requests per minute
- Wait 60 seconds and try again
- Consider upgrading to a paid plan for higher limits

### "API Test Failed" Message
- Check your internet connection
- Verify your API key is correct
- Alpha Vantage may be experiencing downtime (rare)
- App will use sample data as fallback

### Stock Not Found
- Try searching by company name instead of symbol
- Some stocks may not be available in Alpha Vantage
- International stocks may have different symbols

## Alternative APIs

If you want to use a different market data provider, the service is designed to be modular. Other good options include:

### IEX Cloud
- Free tier: 50,000 requests/month
- Good for US stocks
- Real-time and historical data

### Polygon.io
- Free tier: 5 API calls/minute
- Excellent for professional use
- Multiple asset classes

### Finnhub
- Free tier: 60 API calls/minute
- Global market coverage
- WebSocket support

## Security Notes

### API Key Security:
- **Never commit API keys to version control**
- **Use environment variables in production**
- **Consider using a backend proxy for production apps**

### Production Setup:
```typescript
// Use environment variables in production
marketData: {
  apiKey: process.env['ALPHA_VANTAGE_API_KEY'],
  // ... other config
}
```

## Sample Stocks Available

The app includes these sample stocks as fallback data:
- AAPL (Apple Inc.)
- MSFT (Microsoft Corporation)
- GOOGL (Alphabet Inc.)
- AMZN (Amazon.com Inc.)
- TSLA (Tesla Inc.)
- NVDA (NVIDIA Corporation)
- META (Meta Platforms Inc.)
- BRK.B (Berkshire Hathaway Inc.)
- JPM (JPMorgan Chase & Co.)
- V (Visa Inc.)

## Support

If you need help:
1. Check the browser console for detailed error messages
2. Verify your API key at [Alpha Vantage Support](https://www.alphavantage.co/support/)
3. Test with the "Test Market Data API" button in the dashboard

Your portfolio app now has professional-grade market data capabilities! 🚀📈 