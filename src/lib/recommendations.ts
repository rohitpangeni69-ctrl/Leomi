import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { Product } from '../types';

export const logProductInteraction = async (userId: string | undefined, productId: string, type: 'view' | 'click' | 'wishlist' | 'purchase') => {
  if (!userId) return;
  try {
    await addDoc(collection(db, 'interactions'), {
      userId,
      productId,
      type,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Failed to log interaction', error);
  }
};

export const getRecommendedProducts = async (userId: string | undefined, allProducts: Product[]): Promise<Product[]> => {
  if (!userId || allProducts.length === 0) {
    // Fallback to trending/latest products if not logged in
    return allProducts.slice(0, 4);
  }

  try {
    // 1. Get user's recent interactions
    const q = query(
      collection(db, 'interactions'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return allProducts.slice(0, 4);
    }

    const interactedProductIds = snapshot.docs.map(doc => doc.data().productId);
    
    // 2. Find those products to see what categories/colors they like
    const interactedProducts = allProducts.filter(p => interactedProductIds.includes(p.id));
    
    if (interactedProducts.length === 0) {
      return allProducts.slice(0, 4);
    }

    // 3. Simple collaborative filtering / content-based logic:
    // Find the most frequent category
    const categoryCounts: Record<string, number> = {};
    interactedProducts.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    const topCategory = Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b);

    // 4. Recommend products from top category they haven't bought/seen recently
    let recommendations = allProducts.filter(p => p.category === topCategory && !interactedProductIds.includes(p.id));
    
    if (recommendations.length < 4) {
      // fill with other products
      const others = allProducts.filter(p => p.category !== topCategory && !interactedProductIds.includes(p.id));
      recommendations = [...recommendations, ...others];
    }

    return recommendations.slice(0, 4);

  } catch (error) {
    console.error('Failed to get recommendations', error);
    return allProducts.slice(0, 4);
  }
};
