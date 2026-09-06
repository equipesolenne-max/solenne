import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUserAuth } from "../contexts/UserAuthProvider";
import { useWishlist } from "../contexts/WishlistProvider";
import { getOrders } from "../api/account";
import type { OrderRecord } from "../types/admin";

import AccountSidebar, { type AccountTab } from "../components/account/AccountSidebar";
import AccountOverview from "../components/account/AccountOverview";
import PersonalInfoForm from "../components/account/PersonalInfoForm";
import OrdersHistoryView from "../components/account/OrdersHistoryView";
import AddressesManager from "../components/account/AddressesManager";
import AccountWishlist from "../components/account/AccountWishlist";
import UserMessages from "../components/account/UserMessages";

export default function Account() {
  const { user } = useUserAuth();
  const { ids: wishlistIds } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentTabParam = (searchParams.get("tab") as AccountTab) || "overview";
  const [activeTab, setActiveTab] = useState<AccountTab>(currentTabParam);

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  // Sync tab with URL search parameter
  useEffect(() => {
    if (searchParams.get("tab") !== activeTab) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, searchParams, setSearchParams]);

  // Load User Orders scoped strictly to user.uid
  useEffect(() => {
    if (!user) return;
    let active = true;
    setOrdersLoading(true);

    void getOrders()
      .then((payload) => {
        if (!active) return;
        const data = Array.isArray(payload) ? payload : payload.results;
        // Sort orders newest first
        const sorted = [...(data as OrderRecord[])].sort((a, b) => {
          const dateA = a.date || "";
          const dateB = b.date || "";
          return dateB.localeCompare(dateA);
        });
        setOrders(sorted);
      })
      .catch((err) => {
        if (active) setOrdersError(err instanceof Error ? err.message : "Unable to load orders.");
      })
      .finally(() => {
        if (active) setOrdersLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const handleSelectOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  return (
    <div className="max-w-page mx-auto px-6 md:px-10 py-12 lg:py-16">
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
        {/* Responsive Account Sidebar Navigation */}
        <AccountSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          orderCount={orders.length}
          wishlistCount={wishlistIds.length}
        />

        {/* Dynamic Main Dashboard Content */}
        <main className="flex-1 min-w-0 w-full">
          {activeTab === "overview" && (
            <AccountOverview
              orders={orders}
              ordersLoading={ordersLoading}
              onNavigateTab={setActiveTab}
              onSelectOrder={handleSelectOrder}
            />
          )}

          {activeTab === "personal" && <PersonalInfoForm />}

          {activeTab === "orders" && (
            <OrdersHistoryView
              orders={orders}
              loading={ordersLoading}
              error={ordersError}
              onSelectOrder={handleSelectOrder}
            />
          )}

          {activeTab === "addresses" && <AddressesManager />}

          {activeTab === "messages" && <UserMessages />}

          {activeTab === "wishlist" && <AccountWishlist />}
        </main>
      </div>
    </div>
  );
}
