import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalAmount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find(
          (i) => i.product._id === product._id
        );

        if (existing) {
          // Already in cart — increase quantity
          set({
            items: items.map((i) =>
              i.product._id === product._id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          // New item
          set({ items: [...items, { product, quantity }] });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter(
            (i) => i.product._id !== productId
          ),
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.product._id === productId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalAmount: () =>
        get().items.reduce(
          (sum, i) => sum + i.product.price * i.quantity,
          0
        ),
    }),
    {
      name: 'cart-storage', // persists in localStorage
    }
  )
);