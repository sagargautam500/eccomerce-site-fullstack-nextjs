// src/store/wishlistStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { toast } from "sonner";
import { WishlistItem, WishlistProduct } from "@/types/wishlist";

// Product info from API


interface WishlistStore {
  // Server wishlist (logged in user)
  wishlist: WishlistItem[];
  // Guest wishlist (localStorage)
  guestWishlist: WishlistItem[];
  loading: boolean;
  isLoggedIn: boolean;

  // Actions
  setIsLoggedIn: (value: boolean) => void;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (data: {
    productId: string;
    product: WishlistProduct;
  }) => Promise<boolean>;
  removeFromWishlist: (productId: string, isGuest?: boolean) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  mergeGuestWishlist: () => Promise<void>;
  clearWishlist: () => void;
  clearGuestWishlist: () => void;

  // Getters
  getAllWishlistItems: () => WishlistItem[];
  getWishlistCount: () => number;
}

// Generate unique ID for guest wishlist
const generateId = () => `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      wishlist: [],
      guestWishlist: [],
      loading: false,
      isLoggedIn: false,

      // Set login status
      setIsLoggedIn: (value) => set({ isLoggedIn: value }),

      // Fetch wishlist from server
      fetchWishlist: async () => {
        set({ loading: true });
        try {
          const { data } = await axios.get("/api/wishlist/get");
          set({ wishlist: data.wishlist || [], isLoggedIn: true, loading: false });
        } catch (error) {
          console.error("Fetch wishlist error:", error);
          set({ isLoggedIn: false, loading: false });
        }
      },

      // Add to wishlist (handles both guest and logged in)
      addToWishlist: async ({ productId, product }) => {
        set({ loading: true });

        try {
          // Try server first (will fail with 401 if not logged in)
          const { data } = await axios.post("/api/wishlist/add", { productId });

          if (data.success) {
            await get().fetchWishlist();
            toast.success("Added to wishlist!");
            set({ loading: false });
            return true;
          }
          return false;
        } catch (error: any) {
          const status = error.response?.status;

          // Not logged in - add to guest wishlist
          if (status === 401) {
            const guestWishlist = get().guestWishlist;

            // Check if already exists
            const exists = guestWishlist.find((item) => item.productId === productId);

            if (exists) {
              toast.info("Already in wishlist");
              set({ loading: false });
              return true;
            }

            // Add new item
            const newItem: WishlistItem = {
              id: generateId(),
              productId,
              product,
            };
            set({ guestWishlist: [...guestWishlist, newItem], loading: false });
            toast.success("Added to wishlist!");
            return true;
          }

          // Other errors
          const message = error.response?.data?.message || "Failed to add";
          toast.error(message);
          set({ loading: false });
          return false;
        }
      },

      // Remove from wishlist
      removeFromWishlist: async (productId, isGuest = false) => {
        // Check if guest wishlist item
        if (isGuest || productId.startsWith("guest_")) {
          set({
            guestWishlist: get().guestWishlist.filter((item) => item.productId !== productId),
          });
          toast.success("Removed from wishlist");
          return;
        }

        // Server wishlist - optimistic update
        const prevWishlist = get().wishlist;
        set({ wishlist: prevWishlist.filter((item) => item.productId !== productId) });

        try {
          const { data } = await axios.delete("/api/wishlist/delete", { data: { productId } });

          if (data.success) {
            toast.success("Removed from wishlist");
          } else {
            set({ wishlist: prevWishlist });
            toast.error(data.message || "Failed to remove");
          }
        } catch (error: any) {
          console.error("Delete error:", error);
          set({ wishlist: prevWishlist });
          toast.error("Failed to remove");
        }
      },

      // Check if product is in wishlist
      isInWishlist: (productId) => {
        const items = get().getAllWishlistItems();
        return items.some((item) => item.productId === productId);
      },

      // Merge guest wishlist after login
      mergeGuestWishlist: async () => {
        const guestWishlist = get().guestWishlist;
        if (guestWishlist.length === 0) return;

        set({ loading: true });

        try {
          // Add each guest item to server
          for (const item of guestWishlist) {
            await axios.post("/api/wishlist/add", {
              productId: item.productId,
            });
          }

          // Clear guest wishlist and fetch merged wishlist
          set({ guestWishlist: [] });
          await get().fetchWishlist();
          toast.success("Wishlist synced!");
        } catch (error) {
          console.error("Merge error:", error);
          toast.error("Some items could not be synced");
        } finally {
          set({ loading: false });
        }
      },

      // Clear server wishlist
      clearWishlist: () => set({ wishlist: [] }),

      // Clear guest wishlist
      clearGuestWishlist: () => set({ guestWishlist: [] }),

      // Get all wishlist items (combined)
      getAllWishlistItems: () => {
        const { wishlist, guestWishlist, isLoggedIn } = get();
        return isLoggedIn ? wishlist : guestWishlist;
      },

      // Get wishlist count
      getWishlistCount: () => {
        return get().getAllWishlistItems().length;
      },
    }),
    {
      name: "guest-wishlist-storage",
      partialize: (state) => ({ guestWishlist: state.guestWishlist }), // Only persist guest wishlist
    }
  )
);