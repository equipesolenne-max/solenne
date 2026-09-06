import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUserAuth } from "../../contexts/UserAuthProvider";
import { useWishlist } from "../../contexts/WishlistProvider";
import { fetchCustomerAddresses } from "../../services/addresses";
import type { CustomerAddress } from "../../types/user";
import type { OrderRecord } from "../../types/admin";
import type { AccountTab } from "./AccountSidebar";
import { formatDZD } from "../../utils/currency";

interface AccountOverviewProps {
  orders: OrderRecord[];
  ordersLoading: boolean;
  onNavigateTab: (tab: AccountTab) => void;
  onSelectOrder: (orderId: string) => void;
}

export default function AccountOverview({
  orders,
  ordersLoading,
  onNavigateTab,
  onSelectOrder,
}: AccountOverviewProps) {
  const { user } = useUserAuth();
  const { ids: wishlistIds } = useWishlist();
  const [defaultAddress, setDefaultAddress] = useState<CustomerAddress | null>(null);
  const [addressLoading, setAddressLoading] = useState(true);

  const firstName =
    user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "Customer";

  useEffect(() => {
    if (!user) return;
    let active = true;
    void fetchCustomerAddresses(user.uid)
      .then((addresses) => {
        if (!active) return;
        const def = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
        setDefaultAddress(def);
      })
      .catch(() => {
        if (active) setDefaultAddress(null);
      })
      .finally(() => {
        if (active) setAddressLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const recentOrders = orders.slice(0, 3);

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "delivered":
        return "bg-green-100 text-green-900 border-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-900 border-blue-200";
      case "confirmed":
      case "processing":
        return "bg-gold/20 text-midnight border-gold/40";
      case "cancelled":
      case "returned":
        return "bg-red-100 text-red-900 border-red-200";
      default:
        return "bg-ivory-warm text-midnight/80 border-line";
    }
  };

  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <div className="bg-ivory-warm/60 border border-line p-8">
        <span className="font-sans text-[11px] tracking-widest2 uppercase text-gold block mb-2 font-medium">
          Dashboard
        </span>
        <h1 className="font-display text-3xl text-midnight">
          Welcome back, {firstName}
        </h1>
        <p className="font-voice italic text-base text-midnight/70 mt-2">
          Manage your account, track orders, and update shipping preferences.
        </p>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <button
          onClick={() => onNavigateTab("orders")}
          className="text-left border border-line bg-ivory/70 p-6 hover:border-midnight/40 transition-colors group"
        >
          <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/50 block">
            Total Orders
          </span>
          <span className="font-display text-3xl text-midnight block mt-2">
            {ordersLoading ? "..." : orders.length}
          </span>
          <span className="font-sans text-[11px] text-gold mt-3 block group-hover:underline">
            View order history →
          </span>
        </button>

        <button
          onClick={() => onNavigateTab("addresses")}
          className="text-left border border-line bg-ivory/70 p-6 hover:border-midnight/40 transition-colors group"
        >
          <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/50 block">
            Default Wilaya
          </span>
          <span className="font-display text-xl text-midnight truncate block mt-2">
            {addressLoading ? "..." : defaultAddress ? defaultAddress.wilaya : "None set"}
          </span>
          <span className="font-sans text-[11px] text-gold mt-3 block group-hover:underline">
            Manage addresses →
          </span>
        </button>

        <button
          onClick={() => onNavigateTab("wishlist")}
          className="text-left border border-line bg-ivory/70 p-6 hover:border-midnight/40 transition-colors group"
        >
          <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/50 block">
            Saved Wishlist
          </span>
          <span className="font-display text-3xl text-midnight block mt-2">
            {wishlistIds.length}
          </span>
          <span className="font-sans text-[11px] text-gold mt-3 block group-hover:underline">
            View saved items →
          </span>
        </button>
      </div>

      {/* Recent Orders Preview */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h2 className="font-display text-xl text-midnight">Recent Orders</h2>
          <button
            onClick={() => onNavigateTab("orders")}
            className="font-sans text-[11px] tracking-[0.15em] uppercase text-midnight/70 hover:text-gold transition-colors"
          >
            View All ({orders.length}) →
          </button>
        </div>

        {ordersLoading ? (
          <div className="h-28 bg-ivory-warm rounded animate-pulse" />
        ) : recentOrders.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-line bg-ivory-warm/30 p-6">
            <h3 className="font-display text-base text-midnight">No recent orders</h3>
            <p className="font-voice italic text-sm text-midnight/60 mt-1">
              Your SOLENNE journey starts here.
            </p>
            <Link
              to="/shop"
              className="mt-4 inline-block bg-midnight text-ivory font-sans text-[11px] tracking-[0.18em] uppercase px-6 py-3 hover:bg-midnight-deep transition-colors"
            >
              Discover the Collection →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => {
              const firstItem = order.items?.[0];
              return (
                <div
                  key={order.id}
                  className="border border-line bg-ivory/80 p-5 flex flex-wrap items-center justify-between gap-4 hover:border-midnight/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {firstItem?.image && (
                      <img
                        src={firstItem.image}
                        alt={firstItem.name}
                        className="w-14 h-16 object-cover bg-ivory-warm shrink-0 border border-line"
                      />
                    )}
                    <div>
                      <span className="font-sans text-xs font-semibold text-midnight block">
                        Order #{order.order_number ?? order.id}
                      </span>
                      <span className="font-voice italic text-xs text-midnight/60 block mt-0.5">
                        {order.date} · {firstItem?.name ?? "SOLENNE piece"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <span
                      className={`font-sans text-[10px] tracking-[0.14em] uppercase px-2.5 py-1 border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    <span className="font-sans text-xs font-medium text-midnight min-w-[90px] text-right">
                      {formatDZD(order.total)}
                    </span>
                    <button
                      onClick={() => onSelectOrder(order.id)}
                      className="font-sans text-[11px] tracking-[0.14em] uppercase text-midnight hover:text-gold underline"
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Default Shipping Address Snippet */}
      <div className="border border-line bg-ivory/70 p-6 space-y-3">
        <div className="flex items-center justify-between border-b border-line/60 pb-3">
          <h2 className="font-display text-lg text-midnight">Default Shipping Address</h2>
          <button
            onClick={() => onNavigateTab("addresses")}
            className="font-sans text-[11px] tracking-[0.15em] uppercase text-midnight/70 hover:text-gold transition-colors"
          >
            {defaultAddress ? "Edit Address" : "Add Address"} →
          </button>
        </div>

        {addressLoading ? (
          <div className="h-16 bg-ivory-warm rounded animate-pulse" />
        ) : defaultAddress ? (
          <div>
            <p className="font-display text-sm text-midnight">{defaultAddress.fullName}</p>
            <p className="font-sans text-xs text-midnight/70 mt-1">
              {defaultAddress.address}, {defaultAddress.commune}, {defaultAddress.wilaya}
            </p>
            <p className="font-sans text-xs text-midnight/50 mt-1">Phone: {defaultAddress.phone}</p>
          </div>
        ) : (
          <p className="font-voice italic text-xs text-midnight/60">
            No default shipping address set yet. Save an address to speed up your future checkouts.
          </p>
        )}
      </div>
    </div>
  );
}
