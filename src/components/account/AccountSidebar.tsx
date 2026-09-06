import { useUserAuth } from "../../contexts/UserAuthProvider";

export type AccountTab = "overview" | "personal" | "orders" | "addresses" | "wishlist" | "messages";

interface AccountSidebarProps {
  activeTab: AccountTab;
  onSelectTab: (tab: AccountTab) => void;
  orderCount?: number;
  wishlistCount?: number;
}

export default function AccountSidebar({
  activeTab,
  onSelectTab,
  orderCount,
  wishlistCount,
}: AccountSidebarProps) {
  const { logout } = useUserAuth();

  const navItems: Array<{ tab: AccountTab; label: string; count?: number; icon: string }> = [
    { tab: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { tab: "personal", label: "Personal Information", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { tab: "orders", label: "My Orders", count: orderCount, icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
    { tab: "addresses", label: "Addresses", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" },
    { tab: "messages", label: "Messages", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
    { tab: "wishlist", label: "Wishlist", count: wishlistCount, icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0">
      {/* Desktop sidebar navigation */}
      <div className="hidden lg:block border border-line bg-ivory-warm/40 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onSelectTab(item.tab)}
              className={`w-full flex items-center justify-between px-4 py-3.5 text-[12px] font-sans tracking-[0.14em] uppercase text-left transition-colors ${
                isActive
                  ? "bg-midnight text-ivory font-medium"
                  : "text-midnight/70 hover:text-midnight hover:bg-ivory"
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </div>
              {typeof item.count === "number" && item.count > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isActive ? "bg-gold text-midnight font-bold" : "bg-line/60 text-midnight/70"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-3 mt-3 border-t border-line">
          <button
            onClick={() => void logout()}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-[12px] font-sans tracking-[0.14em] uppercase text-left text-red-900/80 hover:text-red-900 hover:bg-red-50 transition-colors"
          >
            <svg className="w-4 h-4 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile horizontal scrolling tab navigation */}
      <div className="lg:hidden flex overflow-x-auto no-scrollbar gap-2 pb-2 border-b border-line mb-8">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onSelectTab(item.tab)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 text-[11px] font-sans tracking-[0.12em] uppercase transition-all ${
                isActive
                  ? "bg-midnight text-ivory font-medium"
                  : "border border-line bg-transparent text-midnight/70"
              }`}
            >
              <span>{item.label}</span>
              {typeof item.count === "number" && item.count > 0 && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${isActive ? "bg-gold text-midnight" : "bg-line text-midnight"}`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
        <button
          onClick={() => void logout()}
          className="shrink-0 px-4 py-2.5 text-[11px] font-sans tracking-[0.12em] uppercase border border-red-200 text-red-800"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
