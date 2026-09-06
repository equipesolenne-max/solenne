import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useUserAuth } from "./UserAuthProvider";
import { getWishlist, saveWishlist } from "../api/account";

interface WishlistContextValue {
  ids: string[];
  loading: boolean;
  toggle: (id: string) => void;
  has: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useUserAuth();
  const [ids, setIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIds([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    void getWishlist()
      .then((value) => {
        if (active) setIds(value.product_ids ?? []);
      })
      .catch(() => {
        if (active) setIds([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (!loading && user) {
      void saveWishlist(ids).catch(() => undefined);
    }
  }, [ids, loading, user]);

  const value = useMemo<WishlistContextValue>(() => ({
    ids,
    loading,
    toggle: (id: string) => setIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ),
    has: (id: string) => ids.includes(id)
  }), [ids, loading]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}
