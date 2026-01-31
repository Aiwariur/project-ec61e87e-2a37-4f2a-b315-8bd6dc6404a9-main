import { create } from 'zustand';

export interface Product {
  id: string | number;
  name: string;
  price: number;
  oldPrice?: number;
  old_price?: number;
  image: string;
  images?: string[];
  category?: string;
  description: string;
  inStock?: boolean;
  in_stock?: boolean;
  specs?: Array<{ key: string; value: string }>;
}

export interface CartItem extends Product {
  quantity: number;
}

interface StoreState {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useStore = create<StoreState>((set, get) => ({
  cart: [],
  
  addToCart: (product) => {
    const cart = get().cart;
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      set({
        cart: cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      });
    } else {
      set({ cart: [...cart, { ...product, quantity: 1 }] });
    }
  },
  
  removeFromCart: (productId) => {
    set({ cart: get().cart.filter(item => item.id !== productId) });
  },
  
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    set({
      cart: get().cart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ),
    });
  },
  
  clearCart: () => set({ cart: [] }),
  
  getTotalPrice: () => {
    return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },
  
  getTotalItems: () => {
    return get().cart.reduce((total, item) => total + item.quantity, 0);
  },
}));
