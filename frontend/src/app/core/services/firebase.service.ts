import { Injectable } from '@angular/core';
import { Observable, from, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

import { User, RegisterRequest, LoginRequest, AuthResponse, Portfolio } from '../interfaces';
import { cleanUndefinedValues, generatePortfolioId } from '../utils/data-cleaning.util';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: any;
  private auth: any;
  private firestore: any;
  private currentUser: User | null = null;

  constructor() {
    if (environment.useFirebase) {
      this.initializeFirebase();
    }
  }

  private initializeFirebase(): void {
    try {
      this.app = initializeApp(environment.firebase);
      this.auth = getAuth(this.app);
      this.firestore = getFirestore(this.app);
      
      // Listen for auth state changes
      onAuthStateChanged(this.auth, async (user: FirebaseUser | null) => {
        if (user) {
          try {
            await this.loadUserProfile(user.uid);
          } catch (error) {
            console.error('Error loading user profile:', error);
            this.currentUser = null;
          }
        } else {
          this.currentUser = null;
        }
      });
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }

  // Authentication Methods
  register(registerData: RegisterRequest): Observable<AuthResponse> {
    if (!environment.useFirebase) {
      return throwError(() => new Error('Firebase not configured'));
    }

    console.log('Register called with data:', registerData);

    return from(
      createUserWithEmailAndPassword(this.auth, registerData.email, registerData.password)
    ).pipe(
      switchMap(async (userCredential) => {
        const user = userCredential.user;
        
        // Construct displayName from available data
        let displayName = registerData.displayName;
        if (!displayName) {
          // Create displayName from firstName + lastName or fallback to username
          if (registerData.firstName && registerData.lastName) {
            displayName = `${registerData.firstName} ${registerData.lastName}`.trim();
          } else if (registerData.username) {
            displayName = registerData.username;
          } else {
            displayName = registerData.email.split('@')[0]; // Use email prefix as fallback
          }
        }

        console.log('Creating user profile with displayName:', displayName);
        
        const userProfile: User = {
          uid: user.uid,
          email: user.email || registerData.email,
          displayName: displayName,
          emailVerified: user.emailVerified,
          createdAt: new Date(),
          // Optional backward compatibility fields
          ...(registerData.username && { username: registerData.username }),
          ...(registerData.firstName && { firstName: registerData.firstName }),
          ...(registerData.lastName && { lastName: registerData.lastName })
        };

        console.log('User profile to be saved:', userProfile);
        
        // Clean the user profile to remove any undefined values
        const cleanUserProfile = cleanUndefinedValues(userProfile);
        console.log('Cleaned user profile:', cleanUserProfile);
        
        await setDoc(doc(this.firestore, 'users', user.uid), cleanUserProfile);
        const token = await user.getIdToken();
        this.currentUser = userProfile; // Use original profile for currentUser
        
        console.log('User registration completed successfully');
        
        return {
          user: userProfile,
          token: token,
          expiresIn: 3600
        };
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return this.handleFirebaseError(error);
      })
    );
  }

  login(loginData: LoginRequest): Observable<AuthResponse> {
    if (!environment.useFirebase) {
      return throwError(() => new Error('Firebase not configured'));
    }

    return from(
      signInWithEmailAndPassword(this.auth, loginData.email, loginData.password)
    ).pipe(
      switchMap(async (userCredential) => {
        const user = userCredential.user;
        const userDoc = await getDoc(doc(this.firestore, 'users', user.uid));
        const userProfile = userDoc.data() as User;
        const token = await user.getIdToken();
        this.currentUser = userProfile;
        
        return {
          user: userProfile,
          token: token,
          expiresIn: 3600
        };
      }),
      catchError(this.handleFirebaseError)
    );
  }

  logout(): Observable<void> {
    if (!environment.useFirebase) {
      return throwError(() => new Error('Firebase not configured'));
    }

    return from(signOut(this.auth)).pipe(
      map(() => {
        this.currentUser = null;
      }),
      catchError(this.handleFirebaseError)
    );
  }

  getCurrentUser(): Observable<User> {
    console.log('getCurrentUser called, currentUser:', this.currentUser);
    
    // First check if we have a current user
    if (this.currentUser && this.currentUser.uid) {
      return of(this.currentUser);
    }
    
    // Check if Firebase auth has a current user
    if (this.auth?.currentUser) {
      console.log('Firebase auth currentUser found:', this.auth.currentUser.uid);
      return from(this.loadUserProfile(this.auth.currentUser.uid)).pipe(
        map(() => {
          if (this.currentUser && this.currentUser.uid) {
            return this.currentUser;
          }
          throw new Error('Failed to load user profile');
        }),
        catchError(error => {
          console.error('Error loading user profile:', error);
          return throwError(() => new Error('No current user'));
        })
      );
    }
    
    // If no Firebase user, check if AuthService has stored user data
    const storedUser = this.getStoredUser();
    if (storedUser && storedUser.uid) {
      console.log('Using stored user:', storedUser);
      this.currentUser = storedUser;
      return of(storedUser);
    }
    
    console.log('No user found anywhere');
    return throwError(() => new Error('No current user'));
  }

  // Portfolio Methods
  getPortfolios(): Observable<Portfolio[]> {
    if (!this.currentUser) {
      return this.getCurrentUser().pipe(
        switchMap(() => this.getPortfolios())
      );
    }

    return from(
      getDocs(query(
        collection(this.firestore, 'portfolios'),
        where('userId', '==', this.currentUser.uid)
      ))
    ).pipe(
      map(querySnapshot => {
        const portfolios: Portfolio[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data();
          const portfolioId = generatePortfolioId(doc.id);
          portfolios.push({ 
            id: portfolioId,
            firebaseId: doc.id,
            ...data 
          } as Portfolio);
        });
        return portfolios;
      }),
      catchError(this.handleFirebaseError)
    );
  }

  createPortfolio(portfolio: Omit<Portfolio, 'id'>): Observable<Portfolio> {
    console.log('createPortfolio called, currentUser:', this.currentUser);
    
    // Ensure we have a current user
    if (!this.currentUser) {
      console.log('No currentUser, attempting to get current user...');
      return this.getCurrentUser().pipe(
        switchMap(user => {
          console.log('Got user from getCurrentUser:', user);
          return this.createPortfolio(portfolio);
        })
      );
    }

    // Get the user ID - handle different possible structures
    const userId = this.currentUser.uid || this.currentUser.id;
    
    if (!userId) {
      console.error('User object has no uid or id:', this.currentUser);
      return throwError(() => new Error('User ID not found'));
    }

    console.log('Creating portfolio with userId:', userId);

    const portfolioData = {
      ...portfolio,
      userId: userId,
      createdAt: new Date().toISOString()
    };

    console.log('Portfolio data to be saved:', portfolioData);

    return from(
      addDoc(collection(this.firestore, 'portfolios'), portfolioData)
    ).pipe(
      map(docRef => {
        const portfolioId = generatePortfolioId(docRef.id);
        const createdPortfolio = {
          id: portfolioId,
          firebaseId: docRef.id,
          ...portfolioData
        } as Portfolio;
        console.log('Portfolio created successfully:', createdPortfolio);
        return createdPortfolio;
      }),
      catchError(error => {
        console.error('Error creating portfolio:', error);
        return this.handleFirebaseError(error);
      })
    );
  }

  updatePortfolio(portfolioId: string, updates: Partial<Portfolio>): Observable<Portfolio> {
    return this.getPortfolios().pipe(
      switchMap(portfolios => {
        const portfolio = portfolios.find(p => p.id?.toString() === portfolioId || p.firebaseId === portfolioId);
        if (!portfolio || !portfolio.firebaseId) {
          throw new Error(`Portfolio with id ${portfolioId} not found`);
        }

        const cleanUpdates = cleanUndefinedValues(updates);

        return from(
          updateDoc(doc(this.firestore, 'portfolios', portfolio.firebaseId), cleanUpdates)
        ).pipe(
          map(() => {
            return { ...portfolio, ...cleanUpdates } as Portfolio;
          })
        );
      }),
      catchError(this.handleFirebaseError)
    );
  }

  deletePortfolio(portfolioId: string): Observable<void> {
    return this.getPortfolios().pipe(
      switchMap(portfolios => {
        const portfolio = portfolios.find(p => p.id?.toString() === portfolioId || p.firebaseId === portfolioId);
        if (!portfolio || !portfolio.firebaseId) {
          throw new Error(`Portfolio with id ${portfolioId} not found`);
        }

        return from(
          deleteDoc(doc(this.firestore, 'portfolios', portfolio.firebaseId))
        ).pipe(
          map(() => void 0)
        );
      }),
      catchError(this.handleFirebaseError)
    );
  }

  // Private Methods
  private async loadUserProfile(uid: string): Promise<void> {
    try {
      console.log('Loading user profile for uid:', uid);
      const userDoc = await getDoc(doc(this.firestore, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        // Ensure the user object has the uid field
        this.currentUser = {
          ...userData,
          uid: uid, // Make sure uid is always set
          id: typeof userData.id === 'number' ? userData.id : undefined // Handle type safely
        };
        console.log('User profile loaded:', this.currentUser);
      } else {
        console.log('No user document found for uid:', uid);
        // Create a minimal user object with the uid from Firebase Auth
        this.currentUser = {
          uid: uid,
          email: this.auth?.currentUser?.email || '',
          emailVerified: this.auth?.currentUser?.emailVerified || false,
          displayName: this.auth?.currentUser?.displayName || null,
          createdAt: new Date()
        };
        console.log('Created minimal user object:', this.currentUser);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.currentUser = null;
      throw error;
    }
  }

  private handleFirebaseError = (error: any): Observable<never> => {
    let errorMessage = 'An error occurred';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Email is already registered';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address';
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage = 'Invalid email or password';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password is too weak';
        break;
      default:
        errorMessage = error.message || 'An unexpected error occurred';
    }
    
    return throwError(() => ({ error: { message: errorMessage } }));
  }

  private getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }
} 