import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "../contexts/AdminAuthProvider";
import { useAdminStats } from "../contexts/AdminStatsProvider";
import AdminNotificationCenter from "../components/AdminNotificationCenter";

interface NavItem {
  to: string;
  label: string;
  badge?: number;
  icon?: React.ReactNode;
}

interface NavSection {
  heading: string;
  items: NavItem[];
}

export default function AdminLayout() {
  const { logout, user } = useAdminAuth();
  const { pendingOrders, unreadInquiries, lowStockProducts } = useAdminStats();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const navSections: NavSection[] = [
    {
      heading: "Overview",
      items: [
        { to: "/admin", label: "Dashboard", icon: <IconDashboard /> }
      ],
    },
    {
      heading: "Shop Management",
      items: [
        { to: "/admin/orders", label: "Orders", badge: pendingOrders, icon: <IconOrders /> },
        { to: "/admin/products", label: "Products", badge: lowStockProducts, icon: <IconProducts /> },
        { to: "/admin/inventory", label: "Inventory", icon: <IconInventory /> },
        { to: "/admin/customers", label: "Customers", icon: <IconCustomers /> },
      ],
    },
    {
      heading: "Communication",
      items: [
        { to: "/admin/messages", label: "Inquiries", badge: unreadInquiries, icon: <IconInquiries /> },
      ],
    },
    {
      heading: "Configuration",
      items: [
        { to: "/admin/cms", label: "Home CMS", icon: <IconCMS /> },
        { to: "/admin/collections", label: "Collections", icon: <IconCollections /> },
        { to: "/admin/categories", label: "Categories", icon: <IconCategories /> },
        { to: "/admin/settings", label: "Settings", icon: <IconSettings /> },
      ],
    },
  ];

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-midnight flex overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden w-[260px] shrink-0 border-r border-line bg-midnight text-ivory lg:flex lg:flex-col">
        <SidebarContent navSections={navSections} logout={logout} />
      </aside>

      {/* Sidebar for Mobile (Drawer) */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 lg:hidden ${
          isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-midnight/40 backdrop-blur-sm" onClick={closeSidebar} />
        <aside
          className={`absolute inset-y-0 left-0 w-[280px] transform bg-midnight transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-6 py-6">
              <div className="font-display text-xl tracking-[0.12em] uppercase text-ivory">SOLENNE</div>
              <button onClick={closeSidebar} className="text-ivory/60 hover:text-ivory">
                <IconClose />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2">
              <SidebarContent navSections={navSections} logout={logout} onItemClick={closeSidebar} />
            </div>
          </div>
        </aside>
      </div>

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-40 h-16 border-b border-line bg-white/80 backdrop-blur-md px-4 sm:px-8">
          <div className="flex h-full items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 text-midnight/60 hover:text-midnight lg:hidden"
              >
                <IconMenu />
              </button>
              <div className="hidden lg:block">
                <h2 className="font-sans text-[10px] tracking-[0.25em] uppercase text-gold">
                  {navSections.flatMap(s => s.items).find(i => i.to === location.pathname)?.label || "Administration"}
                </h2>
              </div>
              <div className="lg:hidden font-display text-lg tracking-widest text-midnight">
                SOLENNE
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center mr-4">
                <div className="relative">
                   <input
                     type="text"
                     placeholder="Quick search..."
                     className="w-48 xl:w-64 bg-ivory-warm/40 border-none rounded-full px-4 py-1.5 text-xs font-sans focus:ring-1 focus:ring-gold/30 transition-all"
                   />
                   <div className="absolute right-3 top-1/2 -translate-y-1/2 text-midnight/30">
                     <IconSearch className="w-3 h-3" />
                   </div>
                </div>
              </div>
              <AdminNotificationCenter />
              <div className="h-4 w-[1px] bg-line hidden sm:block" />
              <div className="flex items-center gap-3 pl-2">
                <div className="hidden md:block text-right">
                  <p className="text-[10px] font-bold text-midnight uppercase tracking-tight">{user?.displayName || "Admin"}</p>
                  <p className="text-[9px] text-midnight/40 truncate max-w-[120px]">{user?.email}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-gold/10 flex items-center justify-center text-gold font-display text-xs border border-gold/20">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "A"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#FDFCF9]">
          <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  navSections,
  logout,
  onItemClick
}: {
  navSections: NavSection[];
  logout: () => void;
  onItemClick?: () => void;
}) {
  const location = useLocation();
  return (
    <>
      <div className="hidden lg:block border-b border-white/5 px-8 py-8">
        <div className="font-display text-2xl tracking-[0.12em] uppercase text-ivory">SOLENNE</div>
        <div className="mt-2 font-sans text-[9px] tracking-[0.3em] uppercase text-gold/80">Atelier Admin</div>
      </div>

      <div className="flex-1 space-y-7 overflow-y-auto px-6 py-8 custom-scrollbar">
        {navSections.map((section) => (
          <div key={section.heading}>
            <div className="mb-3 font-sans text-[9px] tracking-[0.22em] uppercase text-ivory/40">
              {section.heading}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/admin"}
                  onClick={onItemClick}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-lg px-3 py-2.5 transition-all duration-200 ${
                      isActive
                        ? "bg-ivory text-midnight shadow-lg shadow-black/10"
                        : "text-ivory/60 hover:bg-white/5 hover:text-ivory"
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="shrink-0">{item.icon}</span>
                    <span className="font-sans text-[11px] tracking-[0.15em] uppercase leading-none">
                      {item.label}
                    </span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px] font-bold ${
                      location.pathname === item.to ? "bg-midnight text-ivory" : "bg-gold text-midnight"
                    }`}>
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto border-t border-white/5 px-6 py-6">
        <button
          onClick={() => void logout()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-sans text-[11px] tracking-[0.2em] uppercase text-ivory/60 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <IconLogout />
          Logout
        </button>
      </div>
    </>
  );
}

// Icons
function IconDashboard() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>; }
function IconCMS() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>; }
function IconOrders() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>; }
function IconProducts() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>; }
function IconCustomers() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>; }
function IconInquiries() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>; }
function IconInventory() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>; }
function IconCollections() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>; }
function IconCategories() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 11h.01M7 15h.01M10 7h10M10 11h10M10 15h10" /></svg>; }
function IconSettings() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>; }
function IconLogout() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>; }
function IconMenu() { return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>; }
function IconClose() { return <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>; }
function IconSearch({ className }: { className?: string }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>; }

