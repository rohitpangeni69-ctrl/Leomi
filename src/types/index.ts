export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Women' | 'Men' | 'Accessories';
  sizes: string[];
  colors: string[];
  images: string[];
  inStock: boolean;
  stock?: number;
  flashSalePrice?: number;
  flashSaleEndTime?: number;
  createdAt: number;
}

export interface WishlistItem {
  productId: string;
  addedAt: number;
}

export interface Interaction {
  id?: string;
  userId: string;
  productId: string;
  type: 'view' | 'click' | 'wishlist' | 'purchase';
  timestamp: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  shippingAddress: Address;
  paymentMethod: 'eSewa' | 'Khalti' | 'COD';
  paymentStatus: 'Pending' | 'Completed' | 'Failed';
  createdAt: number;
}

export interface Address {
  fullName: string;
  phone: string;
  city: string;
  area: string;
  street: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  createdAt: number;
}
