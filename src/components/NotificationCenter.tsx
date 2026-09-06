import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../contexts/NotificationProvider";

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-midnight hover:text-gold transition-colors focus:outline-none"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <IconBell />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-medium text-ivory">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right bg-ivory shadow-xl border border-line focus:outline-none z-[60]">
          <div className="p-4 border-b border-line flex items-center justify-between">
            <h3 className="font-display text-sm uppercase tracking-wider text-midnight">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-[11px] font-sans uppercase tracking-widest text-gold hover:text-midnight transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-midnight/40 font-voice italic">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs text-midnight/40 font-voice italic">No notifications yet.</p>
              </div>
            ) : (
              <ul className="divide-y divide-line/50">
                {notifications.map((n) => (
                  <li key={n.id} className={`transition-colors hover:bg-ivory-warm/50 ${!n.is_read ? "bg-gold/5" : ""}`}>
                    <Link
                      to={n.url || "/account"}
                      onClick={() => {
                        if (!n.is_read) markAsRead(n.id);
                        setIsOpen(false);
                      }}
                      className="block p-4"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[13px] font-display ${!n.is_read ? "text-midnight" : "text-midnight/70"}`}>
                          {n.title}
                        </span>
                        {!n.is_read && <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0 mt-1.5" />}
                      </div>
                      <p className="mt-1 text-xs text-midnight/60 leading-relaxed font-sans">
                        {n.message}
                      </p>
                      <span className="mt-2 block text-[10px] text-midnight/40 uppercase tracking-tighter">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-3 border-t border-line text-center">
            <Link
              to="/account"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-sans uppercase tracking-widest2 text-midnight/60 hover:text-gold transition-colors"
            >
              View all activity
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function IconBell() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
