import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-midnight text-ivory">
      <div className="max-w-page mx-auto px-6 md:px-10 py-20">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-12 md:gap-8">
          <div>
            <Logo variant="dark" size="md" />
            <p className="font-voice italic text-[15px] text-gold-soft mt-4 max-w-[240px]">
              Quiet luxury for the modern hijab wardrobe.
            </p>
          </div>

          <FooterCol
            title="Shop"
            links={[
              { to: "/shop", label: "All Products" },
              { to: "/collections", label: "Collections" },
              { to: "/shop?filter=new", label: "New Arrivals" },
              { to: "/wishlist", label: "Wishlist" },
            ]}
          />
          <FooterCol
            title="Care"
            links={[
              { to: "/faq", label: "FAQ" },
              { to: "/shipping-returns", label: "Shipping & Returns" },
              { to: "/contact", label: "Contact" },
              { to: "/orders", label: "Track an Order" },
            ]}
          />
          <FooterCol
            title="The House"
            links={[
              { to: "/about", label: "About Solenne" },
              { to: "/privacy-policy", label: "Privacy Policy" },
              { to: "/terms", label: "Terms & Conditions" },
            ]}
          />
        </div>

        <div className="mt-16 pt-8 border-t border-ivory/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-[11px] tracking-[0.15em] uppercase text-ivory/50">
            © {new Date().getFullYear()} Solenne. All rights reserved.
          </p>
          <p className="font-sans text-[11px] tracking-[0.15em] uppercase text-ivory/50">
            Algiers · Paris
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="font-sans text-[11px] tracking-[0.25em] uppercase text-gold mb-5">{title}</h4>
      <ul className="flex flex-col gap-3">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="font-sans text-sm text-ivory/75 hover:text-ivory transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
