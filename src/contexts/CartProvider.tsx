import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useUserAuth } from "./UserAuthProvider";
import type { Product } from "../types/product";
import { getCart, saveCart } from "../api/account";

export interface CartItem {
  product: Product;
  quantity: number;
  variantId?: string;
  color?: string; // Legacy/Fallback
  size?: string;
}

interface CartContextValue {
  items: CartItem[];
  loading: boolean;
  addItem: (product: Product, variantId?: string, quantity?: number) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  removeItem: (productId: string, variantId: string | undefined) => void;
  clear: () => void;
}
const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "solenne-cart";

function readLocal(): CartItem[] { try { return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as CartItem[]; } catch { return []; } }

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useUserAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    if (!user) {
      setItems(readLocal());
      setLoading(false);
      return () => { active = false; };
    }

    void getCart().then((snapshot) => {
      if (!active) return;
      const remoteItems = snapshot.items ?? [];
      const localItems = readLocal();

      if (localItems.length > 0) {
        const merged = [...remoteItems];
        for (const local of localItems) {
          if (!merged.some(m => m.product.id === local.product.id && m.variantId === local.variantId)) {
            merged.push(local);
          }
        }
        setItems(merged);
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        setItems(remoteItems);
      }
    }).catch(() => {
      if (active) setItems(readLocal());
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (loading) return;
    if (user) {
      void saveCart(items).catch(() => undefined);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, loading, user]);

  const value = useMemo<CartContextValue>(() => ({
    items, loading,
    addItem: (product, variantId, quantity = 1) => setItems((current) => {
      const match = current.find((item) => item.product.id === product.id && item.variantId === variantId);
      const variant = product.variants.find(v => v.id === variantId);
      const variantStock = variant?.stock ?? (product.inStock ? Number.MAX_SAFE_INTEGER : 0);

      if (match) {
        return current.map((item) => item === match ? { ...item, quantity: Math.min(item.quantity + quantity, variantStock) } : item);
      }
      return variantStock > 0 ? [...current, { product, variantId, quantity, color: variant?.name, size: variant?.size }] : current;
    }),
    updateQuantity: (productId, variantId, quantity) => setItems((current) =>
      quantity < 1
        ? current.filter((item) => !(item.product.id === productId && item.variantId === variantId))
        : current.map((item) => item.product.id === productId && item.variantId === variantId ? { ...item, quantity } : item)
    ),
    removeItem: (productId, variantId) => setItems((current) =>
      current.filter((item) => !(item.product.id === productId && item.variantId === variantId))
    ),
    clear: () => setItems([]),
  }), [items, loading]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart must be used within CartProvider"); return context; }
