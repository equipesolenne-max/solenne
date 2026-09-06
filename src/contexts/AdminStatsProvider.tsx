import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getDashboard, listContactMessages } from "../api/admin";

interface AdminStats {
  pendingOrders: number;
  unreadInquiries: number;
  lowStockProducts: number;
  loading: boolean;
}

const AdminStatsContext = createContext<AdminStats | undefined>(undefined);

export function AdminStatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<Omit<AdminStats, "loading">>({
    pendingOrders: 0,
    unreadInquiries: 0,
    lowStockProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  const refreshStats = async () => {
    try {
      const [dashboard, messages] = await Promise.all([
        getDashboard(),
        listContactMessages(),
      ]);

      setStats({
        pendingOrders: dashboard.pendingOrders ?? 0,
        unreadInquiries: messages.filter((m) => !m.is_read).length,
        lowStockProducts: dashboard.lowStockProducts ?? 0,
      });
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStats();
    const interval = setInterval(refreshStats, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminStatsContext.Provider value={{ ...stats, loading }}>
      {children}
    </AdminStatsContext.Provider>
  );
}

export function useAdminStats() {
  const context = useContext(AdminStatsContext);
  if (context === undefined) {
    throw new Error("useAdminStats must be used within an AdminStatsProvider");
  }
  return context;
}
