import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAdminNotifications } from "../api/admin";
import type { NotificationRecord } from "../types/communication";

export default function AdminNotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getAdminNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch admin notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60000); // Poll every minute for admin
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-midnight hover:text-gold transition-colors focus:outline-none"
        aria-label="Admin Notifications"
      >
        <IconBell />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right bg-white shadow-2xl border border-line focus:outline-none z-[100]">
          <div className="p-4 border-b border-line flex items-center justify-between">
            <h3 className="text-xs uppercase font-bold tracking-widest text-midnight">Store Activity</h3>
            <span className="text-[10px] text-gray-400">{unreadCount} new</span>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 italic">Checking for updates...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs text-gray-400 italic">All caught up.</p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {notifications.map((n) => (
                  <li key={n.id} className={`transition-colors hover:bg-gray-50 ${!n.is_read ? "bg-red-50/30" : ""}`}>
                    <Link
                      to={n.url || "/admin"}
                      onClick={() => setIsOpen(false)}
                      className="block p-4"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[12px] font-medium ${!n.is_read ? "text-midnight" : "text-gray-500"}`}>
                          {n.title}
                        </span>
                        {!n.is_read && <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />}
                      </div>
                      <p className="mt-1 text-[11px] text-gray-500 leading-normal">
                        {n.message}
                      </p>
                      <span className="mt-2 block text-[9px] text-gray-400 uppercase">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function IconBell() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
