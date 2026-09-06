import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Logo from "./Logo";
import NotificationCenter from "./NotificationCenter";
import { useUserAuth } from "../contexts/UserAuthProvider";

const links = [
  { to: "/shop", label: "Shop" },
  { to: "/collections", label: "Collections" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useUserAuth();

  return (
    <header className="sticky top-0 z-50 bg-ivory/95 backdrop-blur border-b border-line">
      <div className="max-w-page mx-auto px-6 md:px-10 h-[76px] flex items-center justify-between">
        <button
          className="md:hidden font-sans text-xs tracking-widest2 uppercase"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? "Close" : "Menu"}
        </button>

        <nav className="hidden md:flex items-center gap-9">
          {links.slice(0, 2).map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `font-sans text-[13px] tracking-[0.12em] uppercase text-midnight/80 hover:text-gold transition-colors ${
                  isActive ? "text-gold" : ""
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/" className="mx-auto md:mx-0">
          <Logo variant="light" size="md" />
        </Link>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-9">
            {links.slice(2).map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `font-sans text-[13px] tracking-[0.12em] uppercase text-midnight/80 hover:text-gold transition-colors ${
                    isActive ? "text-gold" : ""
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <Link to="/search" aria-label="Search" className="text-midnight hover:text-gold transition-colors">
            <IconSearch />
          </Link>
          {user && <NotificationCenter />}
          <Link to="/account" aria-label="Account" className="text-midnight hover:text-gold transition-colors hidden sm:block">
            <IconUser />
          </Link>
          <Link to="/wishlist" aria-label="Wishlist" className="text-midnight hover:text-gold transition-colors hidden sm:block">
            <IconHeart />
          </Link>
          <Link to="/cart" aria-label="Cart" className="text-midnight hover:text-gold transition-colors">
            <IconBag />
          </Link>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-line bg-ivory">
          <nav className="flex flex-col px-6 py-6 gap-5">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="font-display text-lg text-midnight"
              >
                {l.label}
              </Link>
            ))}
            <Link to="/account" onClick={() => setOpen(false)} className="font-sans text-[13px] tracking-[0.12em] uppercase text-midnight/70">
              Account
            </Link>
            <Link to="/wishlist" onClick={() => setOpen(false)} className="font-sans text-[13px] tracking-[0.12em] uppercase text-midnight/70">
              Wishlist
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function IconSearch() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4.5 5-6.5 8-6.5s6.5 2 8 6.5" strokeLinecap="round" />
    </svg>
  );
}
function IconHeart() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path
        d="M12 20s-7.5-4.6-9.6-9.4C1 6.8 3 3.5 6.5 3.5c2 0 3.6 1.3 4.5 2.9.9-1.6 2.5-2.9 4.5-2.9 3.5 0 5.5 3.3 4.1 7.1C19.5 15.4 12 20 12 20z"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconBag() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M6 8h12l-1 12H7L6 8z" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 016 0v2" strokeLinecap="round" />
    </svg>
  );
}
