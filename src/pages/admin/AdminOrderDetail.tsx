import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAdmin, updateAdmin, getSettings } from "../../api/admin";
import { getImageUrl } from "../../utils/image";
import type { OrderRecord, StoreSettings } from "../../types/admin";
import { defaultSettings } from "../../data/adminMockData";

const orderStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"] as const;

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [status, setStatus] = useState<OrderRecord["status"]>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    void Promise.all([
      getAdmin<OrderRecord>("orders", id),
      getSettings()
    ]).then(([nextOrder, nextSettings]) => {
      setOrder(nextOrder);
      if (nextOrder) setStatus(nextOrder.status);
      if (nextSettings && Object.keys(nextSettings).length > 0) setSettings(nextSettings);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load the order."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-sm text-[#1B2A46]/60">Loading order...</div>;
  if (error) return <div role="alert" className="p-8 text-center text-sm text-red-900">{error}</div>;
  if (!order) {
    return <div className="rounded-[28px] border border-dashed border-[#1B2A46]/20 bg-[#F3EDE1] p-8 text-center font-voice italic text-[#1B2A46]/60">Order not found.</div>;
  }

  const formatCurrency = (value: number) => `${value.toLocaleString("fr-FR")} ${settings.currency}`;
  const shippingCost = order.shipping_cost ?? 0;
  const subtotal = order.subtotal ?? (order.total - shippingCost);

  async function handleStatusUpdate() {
    if (!id) return;
    setSaving(true);
    try {
      await updateAdmin("orders", id, { status });
      setOrder(current => current ? { ...current, status } : null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update the order.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-sans text-[10px] tracking-[0.22em] uppercase text-[#C6A369]">Orders</div>
          <h1 className="mt-2 font-display text-3xl text-[#1B2A46]">{order.order_number || order.id}</h1>
          <div className="mt-2 text-sm text-[#1B2A46]/60">Order ID: {order.id} · {order.date}</div>
        </div>
        <Link to="/admin/orders" className="font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46] hover:text-[#C6A369]">
          Back to orders
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-[#1B2A46]/10 bg-[#F8F4EC] p-5">
            <h2 className="font-display text-2xl text-[#1B2A46]">Customer</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div><div className="font-sans text-[10px] uppercase tracking-[0.16em] text-[#1B2A46]/60">Name</div><div className="mt-1 font-sans text-sm text-[#1B2A46]">{order.customer}</div></div>
              <div><div className="font-sans text-[10px] uppercase tracking-[0.16em] text-[#1B2A46]/60">Email</div><div className="mt-1 font-sans text-sm text-[#1B2A46]">{order.email}</div></div>
              <div><div className="font-sans text-[10px] uppercase tracking-[0.16em] text-[#1B2A46]/60">Phone</div><div className="mt-1 font-sans text-sm text-[#1B2A46]">{order.phone}</div></div>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#1B2A46]/10 bg-[#F8F4EC] p-5">
            <h2 className="font-display text-2xl text-[#1B2A46]">Shipping</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div><div className="font-sans text-[10px] uppercase tracking-[0.16em] text-[#1B2A46]/60">Wilaya</div><div className="mt-1 font-sans text-sm text-[#1B2A46]">{order.shipping?.wilaya}</div></div>
              <div><div className="font-sans text-[10px] uppercase tracking-[0.16em] text-[#1B2A46]/60">Commune</div><div className="mt-1 font-sans text-sm text-[#1B2A46]">{order.shipping?.commune}</div></div>
              <div className="sm:col-span-2"><div className="font-sans text-[10px] uppercase tracking-[0.16em] text-[#1B2A46]/60">Address</div><div className="mt-1 font-sans text-sm text-[#1B2A46]">{order.shipping?.address}</div></div>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#1B2A46]/10 bg-[#F8F4EC] p-5">
            <h2 className="font-display text-2xl text-[#1B2A46]">Order</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#1B2A46]/10 text-[#1B2A46]/60">
                    <th className="pb-3 font-sans text-[10px] tracking-[0.18em] uppercase">Product</th>
                    <th className="pb-3 font-sans text-[10px] tracking-[0.18em] uppercase">Color</th>
                    <th className="pb-3 font-sans text-[10px] tracking-[0.18em] uppercase">Qty</th>
                    <th className="pb-3 font-sans text-[10px] tracking-[0.18em] uppercase">Image</th>
                    <th className="pb-3 font-sans text-[10px] tracking-[0.18em] uppercase">Price</th>
                    <th className="pb-3 font-sans text-[10px] tracking-[0.18em] uppercase">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, index) => (
                    <tr key={`${order.id}-${index}`} className="border-b border-[#1B2A46]/5">
                      <td className="py-3 font-sans text-sm text-[#1B2A46]">{item.name}</td>
                      <td className="py-3 font-sans text-sm text-[#1B2A46]">{item.color || "-"}</td>
                      <td className="py-3 font-sans text-sm text-[#1B2A46]">{item.quantity}</td>
                      <td className="py-3">{item.image ? <img src={getImageUrl(item.image)} alt={item.name} className="h-12 w-10 object-cover" /> : "-"}</td>
                      <td className="py-3 font-sans text-sm text-[#1B2A46]">{formatCurrency(item.price)}</td>
                      <td className="py-3 font-sans text-sm text-[#1B2A46]">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 space-y-2 text-sm text-[#1B2A46]">
              <div className="flex justify-between"><span className="font-sans uppercase tracking-[0.12em] text-[#1B2A46]/60">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span className="font-sans uppercase tracking-[0.12em] text-[#1B2A46]/60">Shipping</span><span>{formatCurrency(shippingCost)}</span></div>
              <div className="flex justify-between text-base font-medium"><span className="font-sans uppercase tracking-[0.12em] text-[#1B2A46]/60">Total</span><span>{formatCurrency(order.total)}</span></div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-[#1B2A46]/10 bg-[#F3EDE1] p-5">
            <h2 className="font-display text-2xl text-[#1B2A46]">Payment</h2>
            <div className="mt-4 space-y-3 text-sm text-[#1B2A46]">
              <div className="flex items-center justify-between"><span className="font-sans uppercase tracking-[0.12em] text-[#1B2A46]/60">Method</span><span>{order.payment_method}</span></div>
              <div className="flex items-center justify-between"><span className="font-sans uppercase tracking-[0.12em] text-[#1B2A46]/60">Status</span><span>{order.payment_status}</span></div>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#1B2A46]/10 bg-[#F8F4EC] p-5">
            <h2 className="font-display text-2xl text-[#1B2A46]">Order status</h2>
            <div className="mt-4">
              <label className="mb-2 block font-sans text-[10px] tracking-[0.18em] uppercase text-[#1B2A46]/60">Update status</label>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as (typeof orderStatuses)[number])}
                className="w-full border border-[#1B2A46]/15 bg-[#F3EDE1] px-4 py-3 font-sans text-sm text-[#1B2A46] outline-none focus:border-[#C6A369]"
              >
                {orderStatuses.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
              <button
                disabled={saving}
                onClick={() => void handleStatusUpdate()}
                className="mt-4 w-full border border-[#1B2A46] bg-[#1B2A46] px-5 py-3 font-sans text-[11px] tracking-[0.18em] uppercase text-[#F8F4EC] hover:bg-[#101B30]"
              >
                {saving ? "Saving..." : "Save status"}
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
