import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import { Product, Order } from '../types';

// Products
export const productsCollection = collection(db, 'products');

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  const q = query(productsCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const products: Product[] = [];
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    callback(products);
  });
};

export const getProduct = async (id: string): Promise<Product | null> => {
  const docRef = doc(db, 'products', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Product;
  }
  return null;
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
  const newRef = doc(productsCollection);
  await setDoc(newRef, {
    ...product,
    createdAt: Date.now()
  });
  return newRef.id;
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
  const docRef = doc(db, 'products', id);
  await updateDoc(docRef, updates);
};

export const deleteProduct = async (id: string) => {
  const docRef = doc(db, 'products', id);
  await deleteDoc(docRef);
};

// Orders
export const ordersCollection = collection(db, 'orders');

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  const q = query(ordersCollection, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders: Order[] = [];
    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    callback(orders);
  });
};

export const subscribeToUserOrders = (userId: string, callback: (orders: Order[]) => void) => {
  const q = query(ordersCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders: Order[] = [];
    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    callback(orders);
  });
};

export const createOrder = async (order: Omit<Order, 'id'>, customId?: string) => {
  const orderRef = customId ? doc(db, 'orders', customId) : doc(ordersCollection);
  
  await runTransaction(db, async (transaction) => {
    // 1. Read all product docs to check stock
    const productRefs = order.items.map(item => doc(db, 'products', item.id));
    const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));

    // 2. Verify stock
    const updates: { ref: any; newStock: number; inStock: boolean }[] = [];
    
    for (let i = 0; i < productDocs.length; i++) {
      const pDoc = productDocs[i];
      if (!pDoc.exists()) {
        throw new Error(`Product ${order.items[i].name} not found`);
      }
      const pData = pDoc.data() as Product;
      const requestedQty = order.items[i].quantity;
      
      const currentStock = pData.stock !== undefined ? pData.stock : 100; // default 100 if undefined
      const newStock = currentStock - requestedQty;
      
      if (newStock < 0) {
        throw new Error(`Not enough stock for ${pData.name}. Only ${currentStock} left.`);
      }
      
      updates.push({
        ref: productRefs[i],
        newStock,
        inStock: newStock > 0
      });
    }

    // 3. Read user data for points
    const userRef = doc(db, 'users', order.userId);
    const userDoc = await transaction.get(userRef);
    let newPoints = Math.floor(order.totalAmount / 1000) * 10;
    let currentUserPoints = 0;
    if (userDoc.exists()) {
      currentUserPoints = userDoc.data().points || 0;
    }

    // 4. Apply updates to products
    updates.forEach(update => {
      transaction.update(update.ref, { 
        stock: update.newStock,
        inStock: update.inStock
      });
    });

    // 5. Update user points
    transaction.set(userRef, { points: currentUserPoints + newPoints }, { merge: true });

    // 6. Create the order
    transaction.set(orderRef, {
      ...order,
      createdAt: Date.now()
    });
  });

  return orderRef.id;
};

export const updateOrderStatus = async (id: string, status: Order['status'], paymentStatus?: Order['paymentStatus']) => {
  const docRef = doc(db, 'orders', id);
  const updates: any = { status };
  if (paymentStatus) {
    updates.paymentStatus = paymentStatus;
  }
  await updateDoc(docRef, updates);
};

export const applyReferralCode = async (code: string, currentUserId: string): Promise<boolean> => {
  if (!code) return false;
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('referralCode', '==', code));
  const snap = await getDocs(q);
  if (snap.empty) return false;
  
  const referrerDoc = snap.docs[0];
  if (referrerDoc.id === currentUserId) return false; // can't refer self
  
  // Award 500 points to referrer
  await updateDoc(doc(db, 'users', referrerDoc.id), {
    points: (referrerDoc.data().points || 0) + 500
  });
  
  return true;
};

// Reviews
export const addReview = async (productId: string, userId: string, userName: string, rating: number, comment: string) => {
  const newRef = doc(collection(db, 'reviews'));
  await setDoc(newRef, {
    productId,
    userId,
    userName,
    rating,
    comment,
    createdAt: Date.now()
  });
};

export const subscribeToReviews = (productId: string, callback: (reviews: any[]) => void) => {
  const q = query(collection(db, 'reviews'), where('productId', '==', productId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const reviews: any[] = [];
    snapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });
    callback(reviews);
  });
};

// Chat
export const sendChatMessage = async (userId: string, userName: string, text: string) => {
  const newRef = doc(collection(db, 'chat_messages'));
  await setDoc(newRef, {
    userId,
    userName,
    text,
    isAdmin: false,
    createdAt: Date.now()
  });
};

export const subscribeToChatMessages = (userId: string, callback: (messages: any[]) => void) => {
  const q = query(collection(db, 'chat_messages'), where('userId', '==', userId), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const messages: any[] = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    callback(messages);
  });
};
