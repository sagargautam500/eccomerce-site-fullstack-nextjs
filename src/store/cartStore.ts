// src/store/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { toast } from "sonner";
import { CartItem, CartProduct } from "@/types/cartItem";

interface AddToCartInput {
  productId: string;
  quantity?: number;
  size?: string;
  color?: string;
  product: CartProduct; // Required for guest cart
}

interface CartStore {
  // Server cart (logged in user)
  cart: CartItem[];
  // Guest cart (localStorage)
  guestCart: CartItem[];
  loading: boolean;
  isLoggedIn: boolean;

  // Actions
  setIsLoggedIn: (value: boolean) => void;
  fetchCart: () => Promise<void>;
  addToCart: (data: AddToCartInput) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number, isGuest?: boolean) => Promise<void>;
  removeFromCart: (itemId: string, isGuest?: boolean) => Promise<void>;
  mergeGuestCart: () => Promise<void>;
  clearCart: () => void;
  clearGuestCart: () => void;

  // Getters
  getAllCartItems: () => CartItem[];
  getCartTotal: () => number;
  getCartItemsCount: () => number;
  getItemQuantity: (productId: string, size?: string, color?: string) => number;
}

// Generate unique ID for guest cart
const generateId = () => `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      guestCart: [],
      loading: false,
      isLoggedIn: false,

      // Set login status
      setIsLoggedIn: (value) => set({ isLoggedIn: value }),

      // Fetch server cart (for logged in users)
      fetchCart: async () => {
        set({ loading: true });
        try {
          const { data } = await axios.get<{ cart: CartItem[] }>("/api/cart/get");
          set({ cart: data.cart || [], isLoggedIn: true });
        } catch (error) {
          console.error("Fetch cart error:", error);
          set({ isLoggedIn: false });
        } finally {
          set({ loading: false });
        }
      },

      // Add to cart (handles both guest and logged in)
      addToCart: async ({ productId, quantity = 1, size, color, product }) => {
        set({ loading: true });

        try {
          // Try server first (will fail with 401 if not logged in)
          const { data } = await axios.post<{ success: boolean; cart?: CartItem[] }>("/api/cart/add", {
            productId,
            quantity,
            size: size || undefined,
            color: color || undefined,
          });

          if (data.success) {
            await get().fetchCart();
            toast.success("Added to cart!");
            return true;
          }
          return false;
        } catch (error: any) {
          const status = error.response?.status;

          // Not logged in - add to guest cart
          if (status === 401) {
            const guestCart = get().guestCart;
            
            // Check if item already exists
            const existingIndex = guestCart.findIndex(
              (item) =>
                item.productId === productId &&
                item.size === size &&
                item.color === color
            );

            if (existingIndex >= 0) {
              // Update quantity
              const updated = [...guestCart];
              updated[existingIndex].quantity += quantity;
              set({ guestCart: updated });
            } else {
              // Add new item
              const newItem: CartItem = {
                id: generateId(),
                productId,
                quantity,
                size,
                color,
                product,
              };
              set({ guestCart: [...guestCart, newItem] });
            }

            toast.success("Added to cart!");
            set({ loading: false, isLoggedIn: false });
            return true;
          }

          // Other errors
          const message = error.response?.data?.message || "Failed to add";
          toast.error(message);
          return false;
        } finally {
          set({ loading: false });
        }
      },

      // Update quantity
      updateQuantity: async (itemId, quantity, isGuest = false) => {
        if (quantity < 1) {
          return get().removeFromCart(itemId, isGuest);
        }

        // Check if guest cart item
        if (isGuest || itemId.startsWith("guest_")) {
          set({
            guestCart: get().guestCart.map((item) =>
              item.id === itemId ? { ...item, quantity } : item
            ),
          });
          return;
        }

        // Server cart - optimistic update
        const prevCart = get().cart;
        set({
          cart: prevCart.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        });

        try {
          await axios.put("/api/cart/update", { itemId, quantity });
        } catch (error) {
          set({ cart: prevCart });
          toast.error("Failed to update");
        }
      },

      // Remove from cart
      removeFromCart: async (itemId, isGuest = false) => {
        // Check if guest cart item
        if (isGuest || itemId.startsWith("guest_")) {
          set({
            guestCart: get().guestCart.filter((item) => item.id !== itemId),
          });
          toast.success("Removed");
          return;
        }

        // Server cart - optimistic update
        const prevCart = get().cart;
        set({ cart: prevCart.filter((item) => item.id !== itemId) });

        try {
          await axios.delete("/api/cart/delete", { 
            data: { itemId } 
          });
          toast.success("Removed");
        } catch (error) {
          set({ cart: prevCart });
          toast.error("Failed to remove");
        }
      },

      // Merge guest cart into server cart after login
      mergeGuestCart: async () => {
        const guestCart = get().guestCart;
        if (guestCart.length === 0) return;

        set({ loading: true });

        try {
          // Add each guest item to server
          for (const item of guestCart) {
            await axios.post("/api/cart/add", {
              productId: item.productId,
              quantity: item.quantity,
              size: item.size || undefined,
              color: item.color || undefined,
            });
          }

          // Clear guest cart and fetch merged cart
          set({ guestCart: [] });
          await get().fetchCart();
          toast.success("Cart synced!");
        } catch (error) {
          console.error("Merge error:", error);
          toast.error("Some items could not be synced");
        } finally {
          set({ loading: false });
        }
      },

      // Clear server cart
      clearCart: () => set({ cart: [] }),

      // Clear guest cart
      clearGuestCart: () => set({ guestCart: [] }),

      // Get all cart items (combined)
      getAllCartItems: () => {
        const { cart, guestCart, isLoggedIn } = get();
        return isLoggedIn ? cart : guestCart;
      },

      // Get total (from active cart)
      getCartTotal: () => {
        const items = get().getAllCartItems();
        return items.reduce(
          (sum, item) => sum + (item.product?.price || 0) * item.quantity,
          0
        );
      },

      // Get items count (from active cart)
      getCartItemsCount: () => {
        const items = get().getAllCartItems();
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },

      // Get specific item quantity
      getItemQuantity: (productId, size, color) => {
        const items = get().getAllCartItems();
        const item = items.find(
          (i) => i.productId === productId && i.size === size && i.color === color
        );
        return item?.quantity || 0;
      },
    }),
    {
      name: "guest-cart-storage",
      partialize: (state) => ({ guestCart: state.guestCart }), // Only persist guest cart
    }
  )
);