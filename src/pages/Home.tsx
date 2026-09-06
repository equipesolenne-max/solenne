import { useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import CollectionCardSkeleton from "../components/CollectionCardSkeleton";
import SectionLabel from "../components/SectionLabel";
import PackagingSection from "../components/PackagingSection";
import heroImage from "../assets/solenne-hero.png";
import { useHomeCatalog } from "../hooks/useCatalog";
import { api } from "../api/client";

export default function Home() {
  const { products, collections, loading, error } = useHomeCatalog();
  const newArrivals = products.filter((p) => p.isNew);
  const displayedNewArrivals = [...newArrivals, ...products.filter((p) => !p.isNew)].slice(0, 4);
  const featured = collections[0];
  const [email, setEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [newsletterError, setNewsletterError] = useState("");
  const [newsletterBusy, setNewsletterBusy] = useState(false);

  async function subscribe(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNewsletterBusy(true);
    setNewsletterMessage("");
    setNewsletterError("");
    try {
      await api.post("/newsletter/subscribe/", { email: email.trim().toLowerCase() });
      setEmail("");
      setNewsletterMessage("You are now on the list.");
    } catch (reason) {
      setNewsletterError(reason instanceof Error ? reason.message : "Unable to subscribe.");
    } finally {
      setNewsletterBusy(false);
    }
  }

  return (
    <div>
      {/* Hero: Structure + Text + High Priority Eager Image */}
      <section className="relative">
        <div className="relative h-[86vh] min-h-[560px] overflow-hidden bg-ivory-warm">
          <img
            src={heroImage}
            alt="Solenne editorial"
            loading="eager"
            // @ts-expect-error HTML fetchpriority attribute
            fetchpriority="high"
            decoding="async"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-midnight/35 via-transparent to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 px-6 text-center z-10">
            <span className="font-sans text-[11px] tracking-widest2 uppercase text-gold-soft mb-5">
              Autumn Collection
            </span>
            <h1 className="font-voice italic text-3xl md:text-5xl text-ivory max-w-2xl leading-[1.2]">
              Quiet luxury for the modern hijab wardrobe
            </h1>
            <Link
              to="/shop"
              className="mt-9 inline-flex items-center gap-2 font-sans text-[12px] tracking-[0.2em] uppercase text-ivory border border-ivory/50 px-8 py-4 hover:bg-ivory hover:text-midnight transition-colors"
            >
              Shop the Collection <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-page mx-auto px-6 md:px-10">
        {/* Featured collection */}
        <section className="py-24 md:py-28">
          <SectionLabel num="01" title="Featured Collection" />
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="order-2 md:order-1">
              <span className="eyebrow">{featured?.name ?? "Solenne"}</span>
              <h2 className="font-display text-2xl md:text-3xl text-midnight mt-4 leading-snug">
                Silk that moves the way you do
              </h2>
              <p className="font-voice italic text-lg text-midnight/60 mt-5 max-w-md">
                {featured?.tagline ?? "Considered pieces for the modern wardrobe."} Woven from a fluid blend that softens with every wear, finished by hand.
              </p>
              <Link
                to={featured ? `/collections/${featured.id}` : "/collections"}
                className="mt-8 inline-block font-sans text-[12px] tracking-[0.2em] uppercase text-midnight border-b border-midnight pb-1 hover:text-gold hover:border-gold transition-colors"
              >
                Discover the Edit →
              </Link>
            </div>
            <Link to={featured ? `/collections/${featured.id}` : "/collections"} className="order-1 md:order-2 block overflow-hidden bg-ivory-warm">
              <img
                src={featured?.image ?? heroImage}
                alt={featured?.name ?? "Solenne collection"}
                loading="lazy"
                decoding="async"
                width="900"
                height="1100"
                className="w-full aspect-[4/5] object-cover"
              />
            </Link>
          </div>
        </section>

        {/* New arrivals with Skeleton fallback */}
        <section className="py-24 md:py-28 border-t border-line">
          <SectionLabel num="02" title="New Arrivals" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-14">
            {loading && Array.from({ length: 4 }).map((_, idx) => <ProductCardSkeleton key={idx} />)}
            {error && <p role="alert" className="col-span-full py-10 text-center text-sm text-red-900">{error}</p>}
            {!loading && !error && displayedNewArrivals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="text-center mt-14">
            <Link
              to="/shop"
              className="inline-block font-sans text-[12px] tracking-[0.2em] uppercase text-midnight border border-line px-8 py-4 hover:border-gold hover:text-gold transition-colors"
            >
              View All Products
            </Link>
          </div>
        </section>
      </div>

      {/* Brand story */}
      <section className="bg-midnight">
        <div className="max-w-page mx-auto px-6 md:px-10 py-24 md:py-28 grid md:grid-cols-2 gap-14 items-center">
          <img
            src={heroImage}
            alt="SOLENNE luxury hijab fabric"
            loading="lazy"
            decoding="async"
            className="w-full aspect-[4/5] object-cover order-1"
          />
          <div className="order-2">
            <span className="font-sans text-[11px] tracking-widest2 uppercase text-gold mb-5 block">
              Our Story
            </span>
            <h2 className="font-display text-2xl md:text-3xl text-ivory leading-snug">
              Modesty, made modern.
            </h2>
            <p className="font-voice italic text-lg text-ivory/70 mt-6 leading-relaxed max-w-md">
              Solenne was founded on a simple belief — that modest dressing deserves the same
              rigor as any luxury house. Every piece begins in small batches, tested for drape,
              weight, and how it moves through an ordinary day.
            </p>
            <Link
              to="/about"
              className="mt-8 inline-block font-sans text-[12px] tracking-[0.2em] uppercase text-ivory border-b border-gold pb-1 hover:text-gold transition-colors"
            >
              Read Our Story →
            </Link>
          </div>
        </div>
      </section>

      {/* Packaging Experience */}
      <PackagingSection />

      <div className="max-w-page mx-auto px-6 md:px-10">
        {/* Collections with Skeleton fallback */}
        <section className="py-24 md:py-28 border-b border-line">
          <SectionLabel num="03" title="Collections" />
          <div className="grid md:grid-cols-3 gap-6">
            {loading && Array.from({ length: 3 }).map((_, idx) => <CollectionCardSkeleton key={idx} />)}
            {!loading && collections.map((c) => (
              <Link key={c.id} to={`/collections/${c.id}`} className="group block">
                <div className="overflow-hidden bg-ivory-warm">
                  <img
                    src={c.image}
                    alt={c.name}
                    loading="lazy"
                    decoding="async"
                    width="900"
                    height="1200"
                    className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <h3 className="font-display text-base text-midnight mt-5">{c.name}</h3>
                <p className="font-voice italic text-sm text-midnight/60 mt-1">{c.tagline}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="max-w-page mx-auto px-6 md:px-10">
        {/* Newsletter */}
        <section className="py-24 md:py-28 text-center">
          <span className="eyebrow">Stay Close</span>
          <h2 className="font-display text-2xl md:text-3xl text-midnight mt-4">
            Join the Solenne circle
          </h2>
          <p className="font-voice italic text-base text-midnight/60 mt-4 max-w-md mx-auto">
            New arrivals, atelier notes, and early access — occasionally, and always with intention.
          </p>
          <form className="mt-9 flex max-w-md mx-auto" onSubmit={subscribe}>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Your email address"
              className="flex-1 bg-transparent border border-line px-5 py-4 font-sans text-sm text-midnight placeholder:text-midnight/40 focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              className="font-sans text-[11px] tracking-[0.15em] uppercase bg-midnight text-ivory px-7 hover:bg-midnight-deep transition-colors"
            >
              {newsletterBusy ? "Sending..." : "Subscribe"}
            </button>
          </form>
          {newsletterMessage && <p role="status" className="mt-4 text-sm text-green-800">{newsletterMessage}</p>}
          {newsletterError && <p role="alert" className="mt-4 text-sm text-red-900">{newsletterError}</p>}
        </section>
      </div>
    </div>
  );
}
