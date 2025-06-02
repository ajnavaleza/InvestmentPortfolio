# Investment Portfolio Application

> **Modern Angular 16 + Firebase Investment Portfolio Management System**

[![Angular](https://img.shields.io/badge/Angular-16-red?style=flat-square&logo=angular)](https://angular.io/)
[![Firebase](https://img.shields.io/badge/Firebase-Latest-orange?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Material UI](https://img.shields.io/badge/Material_UI-Latest-purple?style=flat-square&logo=material-ui)](https://material.angular.io/)

---

## **Project Overview**

A comprehensive investment portfolio tracking application built with modern web technologies. Features real-time market data integration, portfolio analytics, and secure user authentication.

### ✨ **Key Features**
- **Firebase Authentication** (Email/password, secure login)
- **Portfolio Management** (Create, manage multiple portfolios)
- **Real-time Market Data** (Alpha Vantage API integration)
- **Advanced Analytics** (Performance metrics, asset allocation)
- **Cloud Database** (Firestore real-time sync)

###  **Firebase-Only Backend**
- **Authentication**: Firebase Auth with JWT tokens
- **Database**: Firestore NoSQL (real-time sync)
- **Hosting**: Firebase Hosting (optional)

### **Frontend Structure**
```
frontend/
├── src/app/
│   ├── core/              # Services, guards, interceptors
│   ├── components/        # Feature components
│   ├── environments/      # Configuration
│   └── ARCHITECTURE.md    # Detailed code structure
├── DEVELOPMENT_GUIDE.md   # Developer navigation guide
└── README.md              # Frontend documentation
```

---

## **Quick Start**

### **Prerequisites**
- Node.js 16+ and npm
- Firebase account (free tier available)
- Alpha Vantage API key (free tier: 5 requests/minute)

### **Setup**
```bash
# 1. Clone and navigate
cd InvestmentPortfolio/frontend

# 2. Install dependencies
npm install

# 3. Configure environment
# Edit: src/environments/environment.ts
# Add your Firebase config and Alpha Vantage API key

# 4. Start development
ng serve --port 4200

# 5. Open browser
# http://localhost:4200
```

---

## **Project Structure**

### **Root Directory (Clean & Organized)**
```
InvestmentPortfolio/
├── frontend/                    # Complete Angular application
│   ├── src/app/core/           # Business logic & services
│   ├── src/app/components/     # UI components
│   ├── ARCHITECTURE.md         # Code structure guide
│   ├── DEVELOPMENT_GUIDE.md    # Developer navigation
│   └── README.md               # Frontend documentation
├── .git/                       # Git repository
├── .gitignore                  # Git ignore rules
├── package.json                # Root dependencies
└── README.md                   # This file
```

## **Technology Stack**

### **Frontend**
- **Framework**: Angular 16 (Standalone components)
- **UI Library**: Angular Material + CDK
- **Styling**: SCSS with Material Design
- **State Management**: RxJS Observables
- **HTTP Client**: Angular HttpClient
- **Forms**: Angular Reactive Forms

### **Backend & APIs**
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Market Data**: Alpha Vantage API
- **File Storage**: Firebase Storage (if needed)

### **Development Tools**
- **Language**: TypeScript 5.0
- **Build System**: Angular CLI + Webpack
- **Linting**: ESLint + Angular rules
- **Testing**: Jasmine + Karma (unit tests)

---

## **Features Overview**

### **Authentication System**
- Secure email/password registration and login
- Route guards for protected pages
- Automatic session management

### **Portfolio Management**
- Create and manage multiple portfolios
- Add/remove assets with real-time pricing
- Portfolio performance calculations
- Asset allocation tracking

### **Market Data Integration**
- Live stock quotes from Alpha Vantage
- Market indices tracking (S&P 500, NASDAQ, DOW)
- Stock search with autocomplete
- Trending stocks and market news

### **Analytics Dashboard**
- Portfolio performance metrics
- Asset allocation visualization
- Diversification scoring
- Interactive charts and graphs

---

## **Development Workflow**

### **Daily Development**
```bash
# Start development server
cd frontend && ng serve --port 4200

# Run tests
ng test

# Check code quality
ng lint

# Build for production
ng build --prod
```

### **Documentation Navigation**
- **Architecture Overview**: `frontend/src/app/ARCHITECTURE.md`
- **Development Guide**: `frontend/DEVELOPMENT_GUIDE.md`
- **Setup Instructions**: `frontend/README.md`

---

## **Deployment**

### **Firebase Hosting**
```bash
# Build for production
cd frontend && ng build --prod

# Deploy to Firebase
firebase deploy
```

### **Other Platforms**
```bash
# Build production bundle
ng build --prod

# Deploy 'dist/' folder to your hosting provider
```

---

## **Configuration**

### **Environment Setup**
Update `frontend/src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "your-firebase-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    // ... other Firebase config
  },
  marketDataApiKey: 'your-alpha-vantage-key',
  useFirebase: true
};

---

## **Getting Started**

1. **Navigate to frontend**: `cd frontend`
2. **Read setup guide**: Check `README.md` in frontend folder
3. **Configure APIs**: Update environment files
4. **Start developing**: `ng serve --port 4200`