import { create } from 'zustand';
import { WishlistItem } from '../types';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, deleteDoc, collection, onSnapshot, updateDoc, increment } from 'firebase/firestore';

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  setItems: (items: WishlistItem[]) => void;
  toggleItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: true,
  setItems: (items) => set({ items, isLoading: false }),
  
  toggleItem: async (productId: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Must be logged in to manage wishlist');
    
    const isWished = get().isInWishlist(productId);
    const docRef = doc(db, 'users', user.uid, 'wishlist', productId);
    const userRef = doc(db, 'users', user.uid);
    
    // Optimistic UI update could go here, but we will rely on subscription
    if (isWished) {
      await deleteDoc(docRef);
    } else {
      await setDoc(docRef, { addedAt: Date.now() });
      try {
        await updateDoc(userRef, { points: increment(5) }); // Award 5 points for wishlist add
      } catch (e) {
        console.error('Failed to increment points', e);
      }
    }
  },
  
  isInWishlist: (productId: string) => {
    return get().items.some(item => item.productId === productId);
  }
}));

// Setup auth listener to bind wishlist sync
export const subscribeToWishlist = (userId: string) => {
  const colRef = collection(db, 'users', userId, 'wishlist');
  return onSnapshot(colRef, (snapshot) => {
    const items: WishlistItem[] = [];
    snapshot.forEach((doc) => {
      items.push({ productId: doc.id, addedAt: doc.data().addedAt });
    });
    useWishlistStore.getState().setItems(items);
  }, (error) => {
    console.error('Wishlist sync error', error);
  });
};
