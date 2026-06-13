'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  auth,
  googleProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  FirebaseUser,
} from '@/lib/firebase';
import { authService } from '@/services/auth.service';
import { User } from '@/types';

interface AuthContextType {
    firebaseUser: FirebaseUser | null;
    user: User | null;
    loading: boolean;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    registerWithEmail: (email: string, password: string, role?: 'buyer' | 'seller') => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    switchRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  //Sync Firebase with MongoDB
  const syncToMongoDB = async (role?: 'buyer' | 'seller') => {
    try {
      const res = await authService.syncUser(role);
      setUser(res.data);
    } catch (error) {
      console.error('Error syncing user to MongoDB:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      setUser(res.data);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await syncToMongoDB();
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  //Email/Password Login
  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    await syncToMongoDB();
  };

  //Google Login
  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
    await syncToMongoDB();
  };

  //Email/Password Registration
  const registerWithEmail = async (email: string, password: string, role?: 'buyer' | 'seller') => {
    await createUserWithEmailAndPassword(auth, email, password);
    await syncToMongoDB(role);
  };

  // Switch role buyer ↔ seller
  const switchRole = async () => {
    const res = await authService.switchRole();
    setUser(res.data);
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        loading,
        loginWithEmail,
        loginWithGoogle,
        registerWithEmail,
        logout,
        refreshUser,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth anywhere
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}