export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  useMockBackend: true,
  marketData: {
    provider: 'alphavantage',
    apiKey: '1G9JOMJ0WBVIANT1', // Get free key from https://www.alphavantage.co/support/#api-key
    baseUrl: 'https://www.alphavantage.co/query',
    rateLimitMs: 12000 // Free tier: 5 requests per minute (12 seconds between requests)
  }
}; 