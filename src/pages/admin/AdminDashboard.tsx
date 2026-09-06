import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getDashboard, getSettings, listAdmin, listContactMessages } from "../../api/admin";
import type { OrderRecord, ProductRecord, StoreSettings } from "../../types/admin";
import type { ContactMessage } from "../../types/communication";
import { defaultSettings } from "../../data/adminMockData";
import { useAdminStats } from "../../contexts/AdminStatsProvider";
import { getImageUrl } from "../../utils/image";

const rangeDays = { "7d": 7, "30d": 30, "90d": 90, "1y": 365 } as const;

export default function AdminDashboard() {
  const [range, setRange] = useState<keyof typeof rangeDays>("7d");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [inquiries, setInquiries] = useState<ContactMessage[]>([]);
  const [metrics, setMetrics] = useState<Record<string, number> | null>(null);
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);

  const { pendingOrders, unreadInquiries, lowStockProducts: lowStockCount } = useAdminStats();

  useEffect(() => {
    void Promise.all([
      getDashboard(),
      listAdmin<OrderRecord>("orders"),
      listAdmin<ProductRecord>("products"),
      listContactMessages(),
      getSettings()
    ]).then(([dashboard, nextOrders, nextProducts, nextInquiries, nextSettings]) => {
      setMetrics(dashboard);
      setOrders(nextOrders);
      setProducts(nextProducts);
      setInquiries(nextInquiries);
      if (nextSettings && Object.keys(nextSettings).length > 0) setSettings(nextSettings);
    });
  }, []);

  const [now] = useState(() => Date.now());
  const recentOrders = useMemo(() => [...orders].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 5), [orders]);
  const lowStockProducts = useMemo(() => products.filter((product) => (product.stock ?? 0) <= settings.lowStockThreshold).slice(0, 4), [products, settings.lowStockThreshold]);

  const sales = useMemo(() => {
    const cutoff = now - rangeDays[range] * 86400000;
    const recent = orders.filter((order) => Date.parse(order.date || "") >= cutoff);
    return recent.length ? recent.map((order) => order.total) : [0];
  }, [now, orders, range]);

  const formatCurrency = (value: number) => `${value.toLocaleString("fr-FR")} ${settings.currency}`;

  const actionsRequired = [
    {
      label: "Pending Orders",
      count: pendingOrders,
      link: "/admin/orders?status=pending",
      icon: <IconAlertOrders />,
      color: "bg-amber-50 text-amber-900 border-amber-200"
    },
    {
      label: "Unread Inquiries",
      count: unreadInquiries,
      link: "/admin/messages",
      icon: <IconAlertInquiries />,
      color: "bg-blue-50 text-blue-900 border-blue-200"
    },
    {
      label: "Low Stock Items",
      count: lowStockCount,
      link: "/admin/inventory",
      icon: <IconAlertStock />,
      color: "bg-rose-50 text-rose-900 border-rose-200"
    }
  ].filter(action => action.count > 0);

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-4xl text-midnight tracking-tight">Atelier Overview</h1>
        <p className="font-voice italic text-midnight/50 text-lg">Managing the elegance of Solenne.</p>
      </div>

      {/* Action Required Section */}
      {actionsRequired.length > 0 && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <h2 className="font-sans text-[11px] tracking-[0.25em] uppercase text-midnight/60 font-bold">Action Required</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {actionsRequired.map((action) => (
              <Link
                key={action.label}
                to={action.link}
                className={`flex items-center justify-between p-5 rounded-2xl border transition-all hover:shadow-md ${action.color}`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white/50">{action.icon}</div>
                  <div>
                    <div className="text-2xl font-display leading-none">{action.count}</div>
                    <div className="font-sans text-[10px] tracking-widest uppercase mt-1 opacity-70">{action.label}</div>
                  </div>
                </div>
                <div className="text-xl">→</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Main Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Revenue", value: formatCurrency(metrics?.totalRevenue ?? 0), trend: "+12%" },
          { label: "Orders", value: String(metrics?.totalOrders ?? 0), trend: "+5%" },
          { label: "Customers", value: String(metrics?.totalCustomers ?? 0), trend: "+8%" },
          { label: "Avg. Order Value", value: formatCurrency((metrics?.totalRevenue ?? 0) / (metrics?.totalOrders || 1)), trend: "-2%" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-3xl border border-line p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/40 mb-4">{item.label}</div>
            <div className="flex items-end justify-between">
              <div className="font-display text-3xl text-midnight">{item.value}</div>
              {/* <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item.trend.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-rose-600 bg-rose-50'}`}>{item.trend}</div> */}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.8fr_1fr]">
        {/* Sales Chart Placeholder */}
        <section className="bg-white rounded-[32px] border border-line p-8 shadow-sm">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl text-midnight">Sales Performance</h2>
              <p className="text-xs text-midnight/40 mt-1 font-sans uppercase tracking-wider">Revenue distribution over time</p>
            </div>
            <div className="flex gap-1 bg-ivory-warm/40 p-1 rounded-full">
              {Object.keys(rangeDays).map((key) => (
                <button
                  key={key}
                  onClick={() => setRange(key as keyof typeof rangeDays)}
                  className={`rounded-full px-4 py-1.5 font-sans text-[9px] tracking-[0.15em] uppercase transition-all ${
                    range === key ? "bg-midnight text-ivory shadow-sm" : "text-midnight/50 hover:text-midnight"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          <div className="flex h-64 items-end gap-3 px-2">
            {sales.map((value, index) => (
              <div key={`${range}-${index}`} className="group relative flex-1 flex flex-col items-center gap-3">
                <div
                  className="w-full rounded-t-xl bg-gradient-to-t from-gold/40 via-gold/80 to-gold transition-all duration-500 group-hover:via-midnight/80 group-hover:to-midnight"
                  style={{ height: `${Math.max(4, Math.min(100, value / Math.max(...sales, 1) * 100))}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-midnight text-ivory px-2 py-1 rounded text-[9px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatCurrency(value)}
                  </div>
                </div>
                <div className="font-sans text-[8px] uppercase tracking-tighter text-midnight/30">{index + 1}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Lists */}
        <div className="space-y-8">
           {/* Recent Inquiries */}
           <section className="bg-midnight text-ivory rounded-[32px] p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl">Recent Inquiries</h2>
              <Link to="/admin/messages" className="text-[9px] uppercase tracking-widest text-gold hover:text-ivory transition-colors">View all</Link>
            </div>
            <div className="space-y-4">
              {inquiries.slice(0, 3).map((m) => (
                <Link key={m.id} to="/admin/messages" className="block group">
                  <div className={`p-4 rounded-2xl border transition-all ${!m.is_read ? 'bg-white/10 border-white/20' : 'bg-transparent border-white/5 opacity-60'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[11px] font-bold text-ivory truncate">{m.name}</span>
                      <span className="text-[8px] text-ivory/40 uppercase">{new Date(m.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[10px] text-ivory/60 line-clamp-1 italic font-voice">"{m.message}"</p>
                  </div>
                </Link>
              ))}
              {inquiries.length === 0 && <p className="text-xs text-ivory/40 italic text-center py-4">No inquiries recently.</p>}
            </div>
          </section>

          {/* Low Stock */}
          <section className="bg-white rounded-[32px] border border-line p-8 shadow-sm">
            <h2 className="font-display text-xl text-midnight mb-6">Low Inventory</h2>
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-3 rounded-2xl bg-ivory-warm/30 border border-line/50">
                  <img src={getImageUrl(product.images[0])} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-[14px] text-midnight truncate">{product.name}</div>
                    <div className="font-sans text-[9px] uppercase tracking-widest text-midnight/40">{product.category}</div>
                  </div>
                  <div className={`text-[11px] font-bold px-2 py-1 rounded ${product.stock === 0 ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                    {product.stock}
                  </div>
                </div>
              ))}
              <Link to="/admin/inventory" className="block text-center font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/40 hover:text-gold transition-colors pt-2">
                Restock inventory →
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* Recent Orders Table */}
      <section className="bg-white rounded-[32px] border border-line p-8 shadow-sm overflow-hidden">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-midnight">Latest Transactions</h2>
            <p className="text-xs text-midnight/40 mt-1 font-sans uppercase tracking-wider">Most recent order activity</p>
          </div>
          <Link to="/admin/orders" className="rounded-full border border-line px-6 py-2 font-sans text-[10px] tracking-[0.2em] uppercase text-midnight hover:bg-midnight hover:text-ivory transition-all">
            All orders
          </Link>
        </div>

        <div className="overflow-x-auto -mx-8 px-8">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-line text-midnight/40">
                <th className="pb-4 font-sans text-[9px] tracking-[0.2em] uppercase">Order ID</th>
                <th className="pb-4 font-sans text-[9px] tracking-[0.2em] uppercase">Client</th>
                <th className="pb-4 font-sans text-[9px] tracking-[0.2em] uppercase">Date</th>
                <th className="pb-4 font-sans text-[9px] tracking-[0.2em] uppercase text-right">Amount</th>
                <th className="pb-4 font-sans text-[9px] tracking-[0.2em] uppercase text-center">Status</th>
                <th className="pb-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              {recentOrders.map((order) => (
                <tr key={order.id} className="group hover:bg-ivory-warm/20 transition-colors">
                  <td className="py-5 font-sans text-[11px] tracking-widest text-midnight/60">{order.order_number || order.id.slice(0, 8)}</td>
                  <td className="py-5">
                    <div className="font-display text-sm text-midnight">{order.customer}</div>
                    <div className="font-sans text-[9px] text-midnight/40 lowercase">{order.email}</div>
                  </td>
                  <td className="py-5 font-sans text-[12px] text-midnight/60">{new Date(order.date).toLocaleDateString('en-GB')}</td>
                  <td className="py-5 font-sans text-sm text-midnight font-medium text-right">{formatCurrency(order.total)}</td>
                  <td className="py-5 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      order.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                      order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                      'bg-ivory-warm text-midnight/60'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-5 text-right">
                    <Link to={`/admin/orders/${order.id}`} className="text-midnight/20 group-hover:text-gold transition-colors px-2">
                       →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function IconAlertOrders() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }
function IconAlertInquiries() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>; }
function IconAlertStock() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>; }

