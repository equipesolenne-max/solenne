import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useUserAuth } from "../contexts/UserAuthProvider";
import type { OrderRecord } from "../types/admin";
import { formatDZD } from "../utils/currency";
import OrderStatusTracker from "../components/account/OrderStatusTracker";

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useUserAuth();
  const [order, setOrder] = useState<(OrderRecord & { userId?: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id || !user) return;
    let active = true;
    setLoading(true);

    void api.get<OrderRecord & { userId?: string }>(`/orders/${id}/`)
      .then((value) => {
        if (!active) return;
        if (!value) {
          setError("Order not found or unauthorized.");
        } else {
          setOrder(value);
        }
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to load this order.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, user]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 md:px-10 animate-pulse space-y-6">
        <div className="h-4 bg-line/50 rounded w-24" />
        <div className="h-8 bg-line/60 rounded w-1/2" />
        <div className="h-24 bg-ivory-warm rounded" />
        <div className="h-48 bg-ivory-warm rounded" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <p role="alert" className="text-red-900 font-sans">{error || "Order not found."}</p>
        <Link to="/account?tab=orders" className="mt-6 inline-block text-sm text-midnight hover:text-gold uppercase tracking-[0.15em] border-b border-midnight">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:px-10 space-y-10">
      <div>
        <Link
          to="/account?tab=orders"
          className="font-sans text-[11px] tracking-[0.15em] uppercase text-midnight/70 hover:text-gold transition-colors inline-flex items-center gap-1 mb-6"
        >
          ← Back to My Orders
        </Link>
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-6">
          <div>
            <span className="eyebrow">Order Details</span>
            <h1 className="font-display text-3xl text-midnight mt-1">
              Order #{order.order_number ?? order.id}
            </h1>
            <p className="font-voice italic text-sm text-midnight/60 mt-1">
              Placed on {order.date}
            </p>
          </div>
          <div className="text-right">
            <span className="font-sans text-xs text-midnight/60 block">Total Amount</span>
            <span className="font-sans text-xl font-medium text-midnight">{formatDZD(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Visual Order Progress Tracker */}
      <OrderStatusTracker status={order.status} />

      {/* Purchased Items List */}
      <div className="space-y-4">
        <h2 className="font-display text-lg text-midnight border-b border-line pb-3">Items Ordered</h2>
        <div className="divide-y divide-line border-y border-line">
          {order.items.map((item, idx) => (
            <div key={`${item.product_id ?? idx}-${item.color ?? "default"}`} className="py-5 flex gap-5 items-center">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-20 object-cover bg-ivory-warm border border-line shrink-0"
                />
              ) : (
                <div className="w-16 h-20 bg-ivory-warm border border-line shrink-0 flex items-center justify-center text-midnight/40 text-xs font-sans">
                  Piece
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-base text-midnight">{item.name}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 font-sans text-xs text-midnight/70">
                  {item.color && (
                    <span className="inline-flex items-center gap-1.5 bg-ivory-warm px-2.5 py-1 border border-line text-[11px]">
                      Color: {item.color}
                    </span>
                  )}
                  <span>Qty: {item.quantity}</span>
                  <span>Unit: {formatDZD(item.price)}</span>
                </div>
              </div>
              <div className="font-sans text-sm font-medium text-midnight text-right">
                {formatDZD(item.subtotal)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery & Payment Details */}
      <div className="grid md:grid-cols-2 gap-8 pt-4">
        {/* Shipping Address */}
        <div className="border border-line bg-ivory-warm/40 p-6 space-y-3">
          <h3 className="font-display text-base text-midnight border-b border-line/60 pb-2">
            Shipping Address
          </h3>
          <p className="font-sans text-sm font-medium text-midnight">{order.customer}</p>
          <p className="font-sans text-sm text-midnight/80">{order.shipping.address}</p>
          <p className="font-sans text-sm text-midnight/80">
            {order.shipping.commune}, {order.shipping.wilaya}
          </p>
          <p className="font-sans text-xs text-midnight/60 pt-1">Phone: {order.phone}</p>
        </div>

        {/* Order Summary & Payment */}
        <div className="border border-line bg-ivory-warm/40 p-6 space-y-3">
          <h3 className="font-display text-base text-midnight border-b border-line/60 pb-2">
            Payment & Summary
          </h3>
          <div className="flex justify-between font-sans text-xs text-midnight/70">
            <span>Payment Method</span>
            <span className="font-medium text-midnight">{order.payment_method}</span>
          </div>
          <div className="flex justify-between font-sans text-xs text-midnight/70">
            <span>Payment Status</span>
            <span className="uppercase text-[10px] tracking-wider bg-ivory border border-line px-2 py-0.5 font-medium">
              {order.payment_status}
            </span>
          </div>
          <div className="pt-3 border-t border-line/60 space-y-2 font-sans text-sm">
            <div className="flex justify-between text-midnight/70">
              <span>Subtotal</span>
              <span>{formatDZD(order.subtotal ?? order.total)}</span>
            </div>
            <div className="flex justify-between text-midnight/70">
              <span>Shipping Fee</span>
              <span>{order.shipping_cost ? formatDZD(order.shipping_cost) : "Free"}</span>
            </div>
            <div className="flex justify-between font-display text-base text-midnight pt-2 border-t border-line">
              <span>Total</span>
              <span>{formatDZD(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
