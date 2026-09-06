import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { userAuth } from "../api/auth";
import type { ApiUser } from "../api/auth";

interface UserAuthContextValue {
  user: ApiUser | null;
  loading: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateUserProfile: (name: string) => Promise<void>;
}

const UserAuthContext = createContext<UserAuthContextValue | undefined>(undefined);

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void userAuth.currentUser().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const value = useMemo<UserAuthContextValue>(() => ({
    user,
    loading,
    register: async (name, email, password) => {
      setUser(await userAuth.register(name, email, password));
    },
    login: async (email, password) => {
      setUser(await userAuth.login(email, password));
    },
    logout: async () => {
      userAuth.logout();
      setUser(null);
    },
    sendPasswordReset: async (email) => {
      await userAuth.requestPasswordReset(email);
    },
    updateUserProfile: async (name) => {
      setUser(await userAuth.updateProfile(name, user?.phone ?? ""));
    },
  }), [loading, user]);

  return <UserAuthContext.Provider value={value}>{children}</UserAuthContext.Provider>;
}

export function useUserAuth() {
  const context = useContext(UserAuthContext);
  if (!context) throw new Error("useUserAuth must be used within UserAuthProvider");
  return context;
}
