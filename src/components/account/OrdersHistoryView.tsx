import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { OrderRecord } from "../../types/admin";
import { formatDZD } from "../../utils/currency";

interface OrdersHistoryViewProps {
  orders: OrderRecord[];
  loading: boolean;
  error?: string;
  onSelectOrder?: (orderId: string) => void;
}

export default function OrdersHistoryView({
  orders,
  loading,
  error,
  onSelectOrder,
}: OrdersHistoryViewProps) {
  const [filter, setFilter] = useState<string>("All");

  const statuses = ["All", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

  const filteredOrders = useMemo(() => {
    if (filter === "All") return orders;
    return orders.filter((o) => o.status.toLowerCase() === filter.toLowerCase());
  }, [orders, filter]);

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

  if (loading) {
    return (
      <div className="py-8 space-y-6 animate-pulse">
        <div className="h-4 bg-line/50 rounded w-1/4" />
        <div className="space-y-4">
          <div className="h-32 bg-ivory-warm rounded" />
          <div className="h-32 bg-ivory-warm rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="eyebrow">History</span>
        <h2 className="font-display text-2xl text-midnight mt-1">My Orders</h2>
        <p className="font-voice italic text-sm text-midnight/60 mt-1">
          Track and review all your recent Solenne purchases.
        </p>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2 border-b border-line pb-4">
        {statuses.map((st) => {
          const isActive = filter === st;
          return (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`font-sans text-[11px] tracking-[0.14em] uppercase px-4 py-2 transition-all ${
                isActive
                  ? "bg-midnight text-ivory font-medium"
                  : "bg-transparent text-midnight/60 hover:text-midnight hover:bg-ivory-warm"
              }`}
            >
              {st}
            </button>
          );
        })}
      </div>

      {error && (
        <div role="alert" className="p-4 border border-red-900/20 bg-red-50 text-sm text-red-900 font-sans">
          {error}
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-line bg-ivory-warm/30 p-8">
          <svg className="w-10 h-10 mx-auto text-midnight/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="font-display text-lg text-midnight">
            {filter === "All" ? "No orders yet" : `No ${filter.toLowerCase()} orders`}
          </h3>
          <p className="font-voice italic text-sm text-midnight/60 mt-2 max-w-sm mx-auto">
            Your SOLENNE journey starts here. Discover our quiet luxury collection.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-block bg-midnight text-ivory font-sans text-[11px] tracking-[0.2em] uppercase px-7 py-3.5 hover:bg-midnight-deep transition-colors"
          >
            Discover the Collection →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const firstItem = order.items?.[0];
            const extraItemsCount = (order.items?.length ?? 0) - 1;

            return (
              <div
                key={order.id}
                className="border border-line bg-ivory/60 p-6 space-y-4 hover:border-midnight/40 transition-colors"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/60 pb-4">
                  <div>
                    <span className="font-sans text-xs font-semibold text-midnight tracking-wider">
                      Order #{order.order_number ?? order.id}
                    </span>
                    <span className="block font-voice italic text-xs text-midnight/60 mt-0.5">
                      {order.date}
                    </span>
                  </div>
                  <span
                    className={`font-sans text-[10px] tracking-[0.15em] uppercase px-3 py-1 border font-semibold ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Order Items Preview */}
                <div className="flex items-center gap-4 py-2">
                  {firstItem?.image ? (
                    <img
                      src={firstItem.image}
                      alt={firstItem.name}
                      className="w-16 h-20 object-cover bg-ivory-warm shrink-0 border border-line"
                    />
                  ) : (
                    <div className="w-16 h-20 bg-ivory-warm shrink-0 flex items-center justify-center text-midnight/30 text-xs font-sans">
                      Piece
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-display text-sm text-midnight truncate">{firstItem?.name ?? "Solenne Item"}</h4>
                    <p className="font-voice italic text-xs text-midnight/60 mt-0.5">
                      Color: {firstItem?.color ?? "Default"} {firstItem?.quantity && `× ${firstItem.quantity}`}
                    </p>
                    {extraItemsCount > 0 && (
                      <span className="inline-block mt-1 font-sans text-[10px] tracking-wider text-gold font-medium">
                        +{extraItemsCount} more piece{extraItemsCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="font-sans text-xs text-midnight/60 block">Total</span>
                    <span className="font-sans text-sm font-medium text-midnight">{formatDZD(order.total)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-line/60 flex justify-end">
                  {onSelectOrder ? (
                    <button
                      onClick={() => onSelectOrder(order.id)}
                      className="font-sans text-[11px] tracking-[0.15em] uppercase text-midnight border-b border-midnight pb-0.5 hover:text-gold hover:border-gold transition-colors"
                    >
                      View Order Details →
                    </button>
                  ) : (
                    <Link
                      to={`/orders/${order.id}`}
                      className="font-sans text-[11px] tracking-[0.15em] uppercase text-midnight border-b border-midnight pb-0.5 hover:text-gold hover:border-gold transition-colors"
                    >
                      View Order Details →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
