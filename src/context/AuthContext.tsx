import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';
import toast from 'react-hot-toast';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error Details:', errInfo);
  // toast.error(`Database Error: ${errInfo.error.substring(0, 50)}...`);
}

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  manualLogin: (email: string, name: string) => Promise<any>;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'signup';
  openAuthModal: (mode?: 'login' | 'signup') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  const openAuthModal = (mode: 'login' | 'signup' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchProfile(currentUser);
        setIsAuthModalOpen(false);
      } else {
        // Fallback to manual local storage session if Firebase has no active Google user
        const storedUser = localStorage.getItem('manual_session_user');
        const storedProfile = localStorage.getItem('manual_session_profile');
        if (storedUser && storedProfile) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setProfile(JSON.parse(storedProfile));
            // Fetch fresh profile from firestore to check if any new purchases were added
            await fetchProfile(parsedUser);
          } catch (e) {
            console.error("Failed to parse manual session:", e);
            localStorage.removeItem('manual_session_user');
            localStorage.removeItem('manual_session_profile');
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const syncUserPurchases = async (uid: string, email: string): Promise<boolean> => {
    if (!uid || !email) return false;
    try {
      const trimmedEmail = email.trim().toLowerCase();
      
      const q1 = query(
        collection(db, 'orders'), 
        where('userEmail', '==', trimmedEmail),
        where('status', '==', 'completed')
      );
      const q2 = query(
        collection(db, 'orders'), 
        where('userId', '==', uid),
        where('status', '==', 'completed')
      );
      
      const [snap1, snap2] = await Promise.all([
        getDocs(q1).catch(() => ({ forEach: () => {} })),
        getDocs(q2).catch(() => ({ forEach: () => {} }))
      ]);
      
      const purchasedIds = new Set<string>();
      
      snap1.forEach((docSnap: any) => {
        if (docSnap.exists()) {
          const d = docSnap.data();
          if (d.productId) purchasedIds.add(d.productId);
        }
      });

      snap2.forEach((docSnap: any) => {
        if (docSnap.exists()) {
          const d = docSnap.data();
          if (d.productId) purchasedIds.add(d.productId);
        }
      });

      if (purchasedIds.size > 0) {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef).catch(() => null);
        
        let existingPacks: string[] = [];
        let profileExists = false;
        let userData: any = {};
        
        if (userSnap && userSnap.exists()) {
          userData = userSnap.data();
          existingPacks = userData.purchasedProductIds || [];
          profileExists = true;
        }
        
        let updated = false;
        purchasedIds.forEach(pId => {
          if (!existingPacks.includes(pId)) {
            existingPacks.push(pId);
            updated = true;
          }
        });
        
        if (updated || !profileExists) {
          if (profileExists) {
            await updateDoc(userRef, {
              purchasedProductIds: existingPacks
            }).catch(e => console.error("Error updating synced purchases:", e));
          } else {
            const adminEmails = ['ytshivu8@gmail.com', 'shivanagouda.012@gmail.com'];
            const shouldBeAdmin = adminEmails.includes(trimmedEmail);
            await setDoc(userRef, {
              uid,
              email: trimmedEmail,
              displayName: userData.displayName || '',
              isAdmin: userData.isAdmin || shouldBeAdmin,
              purchasedProductIds: existingPacks
            }, { merge: true }).catch(e => console.error("Error setting synced profile:", e));
          }
          
          if (uid.startsWith('manual_')) {
            const freshProfile = {
              uid,
              email: trimmedEmail,
              displayName: userData.displayName || '',
              isAdmin: userData.isAdmin || false,
              purchasedProductIds: existingPacks
            };
            localStorage.setItem('manual_session_profile', JSON.stringify(freshProfile));
          }
          console.log("Successfully synced completed orders into user's purchased packs:", existingPacks);
          return true;
        }
      }
    } catch (error) {
      console.error("Error running syncUserPurchases:", error);
    }
    return false;
  };

  const fetchProfile = async (currentUser: any) => {
    try {
      const docRef = doc(db, 'users', currentUser.uid);
      
      // Try to get document, but don't let a single failure block everything
      let docSnap = await getDoc(docRef).catch(err => {
        console.warn("Initial getDoc failed, might be offline:", err.message);
        return null;
      });

      const adminEmails = ['ytshivu8@gmail.com', 'shivanagouda.012@gmail.com'];
      const existingEmail = docSnap && docSnap.exists() ? (docSnap.data() as UserProfile).email : '';
      const emailToCheck = currentUser.email || existingEmail || '';
      const shouldBeAdmin = emailToCheck ? adminEmails.includes(emailToCheck.trim().toLowerCase()) : false;

      if (currentUser.uid && emailToCheck) {
        const synced = await syncUserPurchases(currentUser.uid, emailToCheck);
        if (synced) {
          docSnap = await getDoc(docRef).catch(() => docSnap);
        }
      }

      if (docSnap && docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        // Enforce admin status from list if it differs from DB
        let finalProfile = data;
        if (data.isAdmin !== shouldBeAdmin) {
          // Fire and forget update to avoid blocking on write
          updateDoc(docRef, { isAdmin: shouldBeAdmin }).catch(e => console.error("Admin sync failed:", e));
          finalProfile = { ...data, isAdmin: shouldBeAdmin };
        }
        setProfile(finalProfile);
        if (currentUser.uid && currentUser.uid.startsWith('manual_')) {
          localStorage.setItem('manual_session_profile', JSON.stringify(finalProfile));
        }
      } else {
        // Fallback or Create Profile
        const newProfile: UserProfile = {
          uid: currentUser.uid,
          email: emailToCheck,
          displayName: currentUser.displayName || '',
          isAdmin: shouldBeAdmin,
          purchasedProductIds: []
        };
        
        setProfile(newProfile);
        if (currentUser.uid && currentUser.uid.startsWith('manual_')) {
          localStorage.setItem('manual_session_profile', JSON.stringify(newProfile));
        }

        // Try to persist the new profile if we are online
        if (docSnap === null) {
           console.log("Skipping initial setDoc because we seem to be offline");
        } else {
          await setDoc(docRef, newProfile).catch(e => {
            console.error("Failed to create profile on server:", e);
          });
        }
      }
    } catch (error) {
      console.error("Critical Profile sync error:", error);
      // We still set a minimal profile if we have enough info
      const adminEmails = ['ytshivu8@gmail.com', 'shivanagouda.012@gmail.com'];
      const emailToCheck = currentUser.email || '';
      const fallbackProfile: UserProfile = {
        uid: currentUser.uid,
        email: emailToCheck,
        displayName: currentUser.displayName || '',
        isAdmin: emailToCheck ? adminEmails.includes(emailToCheck.trim().toLowerCase()) : false,
        purchasedProductIds: []
      };
      setProfile(fallbackProfile);
      if (currentUser.uid && currentUser.uid.startsWith('manual_')) {
        localStorage.setItem('manual_session_profile', JSON.stringify(fallbackProfile));
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const login = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      await signInWithPopup(auth, provider);
      toast.success("Signed in successfully!");
    } catch (error: any) {
      console.error("Firebase Auth Error:", error);
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error(`Login Failed: ${error.message}`);
      }
    }
  };

  const manualLogin = async (email: string, name: string) => {
    try {
      const formattedEmail = email.trim().toLowerCase();
      const formattedName = name.trim();
      
      // Helper to generate a compliant document ID deterministic from email
      const encodeEmailToUid = (em: string) => {
        try {
          return 'manual_' + btoa(em).replace(/[^a-zA-Z0-9]/g, '_');
        } catch (e) {
          return 'manual_' + em.replace(/[^a-zA-Z0-9]/g, '_');
        }
      };
      
      const uid = encodeEmailToUid(formattedEmail);
      const docRef = doc(db, 'users', uid);
      
      const docSnap = await getDoc(docRef).catch(err => {
        console.warn("Manual login profile getDoc failed:", err.message);
        return null;
      });

      const adminEmails = ['ytshivu8@gmail.com', 'shivanagouda.012@gmail.com'];
      const shouldBeAdmin = adminEmails.includes(formattedEmail);

      let pData: UserProfile;
      if (docSnap && docSnap.exists()) {
        pData = docSnap.data() as UserProfile;
        if (pData.displayName !== formattedName) {
          pData.displayName = formattedName;
          await setDoc(docRef, pData).catch(e => console.error("Update manual name failed:", e));
        }
      } else {
        pData = {
          uid,
          email: formattedEmail,
          displayName: formattedName,
          isAdmin: shouldBeAdmin,
          purchasedProductIds: []
        };
        await setDoc(docRef, pData).catch(e => {
          console.error("Failed to create profile on server:", e);
        });
      }

      const customUser = {
        uid: pData.uid,
        email: pData.email,
        displayName: pData.displayName,
        emailVerified: true,
        isAnonymous: false,
      };

      localStorage.setItem('manual_session_user', JSON.stringify(customUser));
      localStorage.setItem('manual_session_profile', JSON.stringify(pData));

      setUser(customUser);
      setProfile(pData);
      setIsAuthModalOpen(false);
      toast.success(`Welcome, ${formattedName}!`);
      return customUser;
    } catch (error: any) {
      console.error("Manual LogIn Error:", error);
      toast.error(`Manual Login Failed: ${error.message}`);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('manual_session_user');
      localStorage.removeItem('manual_session_profile');
      await signOut(auth);
      setUser(null);
      setProfile(null);
      toast.success("Logged out");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, profile, loading, login, manualLogin, refreshProfile, logout, 
      isAuthModalOpen, setIsAuthModalOpen, authModalMode, openAuthModal 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
