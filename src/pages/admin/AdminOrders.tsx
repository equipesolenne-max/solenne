import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAdminCollection } from "../../hooks/useAdminCollection";
import { getSettings, updateAdmin } from "../../api/admin";
import type { OrderRecord, StoreSettings } from "../../types/admin";
import { defaultSettings } from "../../data/adminMockData";

const statusFilters = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"] as const;

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get("status") || "all";
  const [query, setQuery] = useState("");
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: allOrders, loading, refresh } = useAdminCollection<OrderRecord>("orders");

  const orders = useMemo(() => {
    let filtered = filter === "all" ? allOrders : allOrders.filter((order) => order.status === filter);
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(o =>
        o.customer.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.order_number?.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q)
      );
    }
    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  }, [allOrders, filter, query]);

  useEffect(() => {
    void getSettings().then((value) => {
      if (value && Object.keys(value).length > 0) setSettings(value);
    });
  }, []);

  const formatCurrency = (value: number) => `${value.toLocaleString("fr-FR")} ${settings.currency}`;

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateAdmin("orders", orderId, { status: newStatus });
      await refresh();
    } catch (err) {
      console.error("Failed to update order status", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-50 text-amber-700 border-amber-200";
      case "confirmed": return "bg-blue-50 text-blue-700 border-blue-200";
      case "shipped": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "delivered": return "bg-green-50 text-green-700 border-green-200";
      case "cancelled": return "bg-rose-50 text-rose-700 border-rose-200";
      default: return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-midnight tracking-tight">Orders</h1>
          <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/40 mt-1">Manage customer purchases and fulfillment</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-line rounded-full font-sans text-[10px] tracking-widest uppercase text-midnight hover:bg-ivory-warm transition-colors">Export CSV</button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-line p-6 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="flex flex-wrap gap-1.5 bg-ivory-warm/30 p-1.5 rounded-2xl w-full lg:w-auto overflow-x-auto">
            {statusFilters.map((status) => (
              <button
                key={status}
                onClick={() => setSearchParams(status === "all" ? {} : { status })}
                className={`whitespace-nowrap rounded-xl px-4 py-2 font-sans text-[9px] tracking-[0.15em] uppercase transition-all ${
                  filter === status ? "bg-midnight text-ivory shadow-md" : "text-midnight/50 hover:text-midnight"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email or ID..."
              className="w-full bg-ivory-warm/20 border border-line rounded-2xl px-5 py-2.5 text-xs font-sans focus:ring-1 focus:ring-gold/30 outline-none transition-all"
            />
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-midnight/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-line text-midnight/40">
                <th className="pb-4 pl-2 font-sans text-[9px] tracking-[0.2em] uppercase">Order</th>
                <th className="pb-4 font-sans text-[9px] tracking-[0.2em] uppercase">Customer</th>
                <th className="pb-4 font-sans text-[9px] tracking-[0.2em] uppercase">Date</th>
                <th className="pb-4 font-sans text-[9px] tracking-[0.2em] uppercase text-right">Total</th>
                <th className="pb-4 font-sans text-[9px] tracking-[0.2em] uppercase text-center">Status</th>
                <th className="pb-4 pr-2 font-sans text-[9px] tracking-[0.2em] uppercase text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              {orders.map((order) => (
                <tr key={order.id} className="group hover:bg-ivory-warm/10 transition-colors">
                  <td className="py-5 pl-2">
                    <Link to={`/admin/orders/${order.id}`} className="font-sans text-[11px] tracking-widest text-midnight hover:text-gold transition-colors font-bold uppercase">
                      #{order.order_number || order.id.slice(0, 8)}
                    </Link>
                  </td>
                  <td className="py-5">
                    <div className="font-display text-sm text-midnight">{order.customer}</div>
                    <div className="font-sans text-[9px] text-midnight/40 lowercase">{order.email}</div>
                  </td>
                  <td className="py-5 font-sans text-[12px] text-midnight/60">{new Date(order.date).toLocaleDateString('en-GB')}</td>
                  <td className="py-5 font-sans text-sm text-midnight font-medium text-right">{formatCurrency(order.total)}</td>
                  <td className="py-5 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-5 pr-2 text-right">
                    <select
                      disabled={updatingId === order.id}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="bg-transparent border-none text-[10px] uppercase font-sans tracking-widest text-midnight/40 hover:text-midnight focus:ring-0 cursor-pointer text-right outline-none appearance-none"
                    >
                      {statusFilters.filter(s => s !== 'all').map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {updatingId === order.id && <span className="ml-2 animate-spin inline-block w-2 h-2 border-t-2 border-midnight rounded-full" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && allOrders.length === 0 && (
            <div className="p-20 flex flex-col items-center justify-center text-midnight/20">
              <div className="animate-spin w-8 h-8 border-t-2 border-midnight rounded-full mb-4" />
              <p className="font-voice italic">Accessing order ledger...</p>
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="p-20 text-center text-midnight/30 font-voice italic">
              No orders found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

