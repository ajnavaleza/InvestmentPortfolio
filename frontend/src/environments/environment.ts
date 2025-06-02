/**
 * Environment Configuration - Firebase Only
 * 
 * This configuration is set up to use Firebase as the backend.
 * Java backend references have been removed to avoid CORS issues.
 */

export const environment = {
  production: false,
  
  // Firebase configuration
  firebase: {
    apiKey: "AIzaSyC82xdGcIE0IDn7yymWdaP6V5GDLiLK0NY",
    authDomain: "investment-portfolio-86c83.firebaseapp.com",
    projectId: "investment-portfolio-86c83",
    storageBucket: "investment-portfolio-86c83.firebasestorage.app",
    messagingSenderId: "358291242871",
    appId: "1:358291242871:web:98f8d6531a93c071416b72"
  },
  useFirebase: true, // Using Firebase as the primary backend
  
  // Market data API (Alpha Vantage)
  marketDataApiKey: '1G9JOMJ0WBVIANT1',
  marketDataBaseUrl: 'https://www.alphavantage.co'
}; 