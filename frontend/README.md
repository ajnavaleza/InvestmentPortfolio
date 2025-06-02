# Investment Portfolio - Frontend Application 🚀

## 📋 **Overview**

A modern Angular 16 application for investment portfolio management, built with **Firebase** as the backend and **Alpha Vantage** for real-time market data.

### ✅ **What's Included**
- 🔐 **Firebase Authentication** (Register, Login, Logout)
- 💼 **Portfolio Management** (Create, Update, Delete, View)
- 📊 **Real-time Market Data** (Alpha Vantage API integration)
- 📈 **Portfolio Analysis** (Performance metrics, asset allocation)
- 🎨 **Material Design UI** (Modern, responsive interface)
- 🔒 **Route Guards** (Protected pages)

---

## 🏗️ **Architecture**

### **Backend: Firebase Only**
- **Authentication**: Firebase Auth
- **Database**: Firestore NoSQL database  
- **Real-time Sync**: Automatic data synchronization
- **No CORS Issues**: Client-side Firebase SDK

### **External APIs**
- **Market Data**: Alpha Vantage API for live stock prices
- **HTTP Calls**: Only to Alpha Vantage (no backend CORS issues)

---

## 📁 **Project Structure**

```
src/app/
├── components/           # Feature components
│   ├── auth/            # Authentication (Register)
│   ├── dashboard/       # Main dashboard & login
│   ├── market-data/     # Live market data
│   ├── analysis/        # Portfolio analysis
│   ├── portfolio-item/  # Portfolio management
│   └── portfolio-form/  # Portfolio creation forms
├── services/            # Business logic
│   ├── auth.service.ts      # Firebase authentication
│   ├── firebase.service.ts  # Firebase operations  
│   ├── portfolio.service.ts # Portfolio management
│   └── market-data.service.ts # Alpha Vantage API
├── interceptors/        # HTTP interceptors
└── environments/        # Configuration
```

---

## 🔧 **Configuration**

### **Environment Setup** (`src/environments/environment.ts`)

```typescript
export const environment = {
  production: false,
  
  // Firebase configuration
  firebase: {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.firebasestorage.app",
    messagingSenderId: "123456789",
    appId: "your-app-id"
  },
  useFirebase: true,
  
  // Alpha Vantage API
  marketDataApiKey: 'your-alpha-vantage-key',
  marketDataBaseUrl: 'https://www.alphavantage.co'
};
```

---

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 16+
- Angular CLI 16
- Firebase account
- Alpha Vantage API key (free)

### **Installation**

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   - Update `src/environments/environment.ts` with your Firebase config
   - Ensure Firestore security rules are set up

3. **Configure Alpha Vantage**
   - Get free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
   - Update `marketDataApiKey` in environment files

4. **Start development server**
   ```bash
   ng serve --port 4200
   ```

5. **Open application**
   ```
   http://localhost:4200
   ```

---

## 🔥 **Firebase Setup**

### **Authentication Rules**
- Email/password authentication enabled
- User profile data stored in Firestore

### **Firestore Database Structure**

```
users/
  {userId}/
    - id: number
    - username: string
    - email: string
    - firstName?: string
    - lastName?: string
    - createdAt: string

portfolios/
  {portfolioId}/
    - name: string
    - description: string
    - totalValue: number
    - userId: number
    - assets: Asset[]
    - performance: PerformanceMetric[]
    - createdAt: string
```

### **Security Rules** (Firestore)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only access their own portfolios
    match /portfolios/{portfolioId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId.toString();
    }
  }
}
```

---

## 📡 **API Integration**

### **Firebase Services**
- Authentication (login/register/logout)
- Portfolio CRUD operations
- Real-time data synchronization
- User profile management

### **Alpha Vantage Services**
- Live stock quotes
- Market indices (S&P 500, NASDAQ, DOW)
- Stock search functionality
- Market news (when available)

---

## 🛡️ **Security Features**

### **Authentication Guards**
- Protected routes require login
- Automatic redirect to login page
- Token-based authentication via Firebase

### **HTTP Interceptor**
- Handles authentication errors
- Automatically logs out on 401/403 errors
- Allows external API calls (Alpha Vantage)

---

## 🎯 **Key Features**

### **Portfolio Management**
- ✅ Create multiple portfolios
- ✅ Add/edit/delete assets
- ✅ Real-time value calculations
- ✅ Asset allocation pie charts
- ✅ Performance tracking

### **Market Data**
- ✅ Live stock prices
- ✅ Market indices tracking
- ✅ Stock search with autocomplete
- ✅ Trending stocks display
- ✅ Market news integration

### **Analysis Tools**
- ✅ Portfolio performance metrics
- ✅ Asset allocation visualization
- ✅ Diversification scoring
- ✅ Trend indicators

---

## 🔍 **Troubleshooting**

### **Common Issues**

**1. CORS Errors**
- ✅ **Fixed**: No more Java backend calls
- ✅ **Solution**: Firebase client SDK used instead

**2. Authentication Issues**
- Check Firebase configuration
- Verify Firestore security rules
- Ensure email/password auth is enabled

**3. Market Data Issues**
- Verify Alpha Vantage API key
- Check API rate limits (5 requests/minute free tier)
- Fallback sample data available when API unavailable

### **Error Resolution**
- Check browser console for detailed error messages
- Verify Firebase project settings
- Ensure network connectivity for external APIs

---

## 🚀 **Deployment**

### **Firebase Hosting**
```bash
ng build --prod
firebase deploy
```

### **Other Platforms**
```bash
ng build --prod
# Deploy dist/ folder to your hosting provider
```

---

## 📈 **Performance Optimizations**

- **Lazy Loading**: All feature modules are lazy-loaded
- **OnPush**: Change detection optimization
- **Caching**: Market data caching (5-minute TTL)
- **Bundle Splitting**: Separate chunks for better loading

---

## 🔄 **Development Workflow**

1. **Start Development Server**
   ```bash
   ng serve --port 4200
   ```

2. **Run Tests**
   ```bash
   ng test
   ```

3. **Build for Production**
   ```bash
   ng build --prod
   ```

4. **Lint Code**
   ```bash
   ng lint
   ```

---

## 📞 **Support**

- **Firebase Issues**: Check Firebase Console
- **Market Data Issues**: Alpha Vantage documentation  
- **Application Issues**: Check browser console

---

## 🎉 **Clean Architecture Benefits**

✅ **No CORS Issues**: Firebase client SDK eliminates CORS problems  
✅ **Real-time Data**: Automatic Firestore synchronization  
✅ **Scalable**: Firebase auto-scaling infrastructure  
✅ **Secure**: Built-in Firebase security rules  
✅ **Fast**: Optimized for modern web standards  

---

*Last Updated: December 2024* 