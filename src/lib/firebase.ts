import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { create } from 'zustand';
import { subscribeToWishlist, useWishlistStore } from '../store/wishlistStore';

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); // CRITICAL
export const auth = getAuth();

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
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

interface AuthState {
  user: FirebaseUser | null;
  isAdmin: boolean;
  isReady: boolean;
  setUser: (user: FirebaseUser | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setReady: (isReady: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdmin: false,
  isReady: false,
  setUser: (user) => set({ user }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setReady: (isReady) => set({ isReady }),
}));

let wishlistUnsubscribe: (() => void) | null = null;

onAuthStateChanged(auth, async (user) => {
  useAuthStore.getState().setUser(user);
  
  if (wishlistUnsubscribe) {
    wishlistUnsubscribe();
    wishlistUnsubscribe = null;
    useWishlistStore.getState().setItems([]);
  }

  if (user) {
    wishlistUnsubscribe = subscribeToWishlist(user.uid);
    try {
      const userDoc = await getDocFromServer(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        useAuthStore.getState().setIsAdmin(userDoc.data().role === 'admin' || user.email === 'rohitpangeni69@gmail.com');
      } else if (user.email === 'rohitpangeni69@gmail.com') {
        useAuthStore.getState().setIsAdmin(true);
      } else {
        useAuthStore.getState().setIsAdmin(false);
      }
    } catch (e) {
      console.error('Error fetching user document:', e);
      useAuthStore.getState().setIsAdmin(user.email === 'rohitpangeni69@gmail.com');
    }
  } else {
    useAuthStore.getState().setIsAdmin(false);
  }
  useAuthStore.getState().setReady(true);
});
