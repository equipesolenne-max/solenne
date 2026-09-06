import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import type { AdminUser } from "../types/admin";
import { adminAuth } from "../api/auth";

interface AdminAuthContextValue {
  user: AdminUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isAdminArea = location.pathname.startsWith("/admin");
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdminArea) {
      setUser(null);
      setLoading(false);
      return;
    }
    void adminAuth.currentUser().then((candidate) => {
      setUser(candidate?.role === "admin" ? { uid: candidate.uid, email: candidate.email, displayName: candidate.displayName, role: "admin" } : null);
    }).catch(() => setUser(null)).finally(() => setLoading(false));
  }, [isAdminArea]);

  const value = useMemo<AdminAuthContextValue>(() => ({
    user,
    loading,
    isAdmin: user?.role === "admin",
    login: async (email: string, password: string) => {
      const candidate = await adminAuth.login(email, password);
      if (candidate.role !== "admin") {
        adminAuth.logout();
        throw new Error("This account is not authorized to access the admin area.");
      }
      setUser({ uid: candidate.uid, email: candidate.email, displayName: candidate.displayName, role: "admin" });
    },
    logout: async () => {
      adminAuth.logout();
      setUser(null);
    },
  }), [user, loading]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }

  return context;
}
