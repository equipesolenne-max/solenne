import { useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import SectionLabel from "../components/SectionLabel";
import PackagingSection from "../components/PackagingSection";
import { useHome } from "../hooks/useHome";
import { api } from "../api/client";
import type { HomeSectionRecord } from "../types/admin";
import { toProduct, toCollection } from "../services/catalog";
import { getImageUrl } from "../utils/image";

export default function Home() {
  const { sections, loading } = useHome();
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

  if (loading && sections.length === 0) {
    return <div className="min-h-screen flex items-center justify-center bg-ivory font-voice italic text-midnight/40">Loading Solenne...</div>;
  }

  return (
    <div className="bg-ivory">
      {sections.map((section, idx) => (
        <SectionRenderer key={section.id} section={section} index={idx} />
      ))}

      {/* Static sections or ones not yet in CMS */}
      <PackagingSection />

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

function SectionRenderer({ section, index }: { section: HomeSectionRecord; index: number }) {
  const num = (index + 1).toString().padStart(2, "0");

  switch (section.section_type) {
    case "hero":
      return (
        <section className="relative">
          <div className="relative h-[86vh] min-h-[560px] overflow-hidden bg-ivory-warm">
            {section.media_url && (
              <img
                src={getImageUrl(section.media_url)}
                alt={section.title}
                loading="eager"
                // @ts-expect-error fetchpriority
                fetchpriority="high"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/35 via-transparent to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 px-6 text-center z-10">
              {section.subtitle && (
                <span className="font-sans text-[11px] tracking-widest2 uppercase text-gold-soft mb-5">
                  {section.subtitle}
                </span>
              )}
              <h1 className="font-voice italic text-3xl md:text-5xl text-ivory max-w-2xl leading-[1.2]">
                {section.title}
              </h1>
              {section.button_text && (
                <Link
                  to={section.link || "/shop"}
                  className="mt-9 inline-flex items-center gap-2 font-sans text-[12px] tracking-[0.2em] uppercase text-ivory border border-ivory/50 px-8 py-4 hover:bg-ivory hover:text-midnight transition-colors"
                >
                  {section.button_text} <span aria-hidden>→</span>
                </Link>
              )}
            </div>
          </div>
        </section>
      );

    case "featured_collection":
      const collection = section.collection_detail;
      return (
        <div className="max-w-page mx-auto px-6 md:px-10">
          <section className="py-24 md:py-28">
            <SectionLabel num={num} title={section.title || "Featured Collection"} />
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="order-2 md:order-1">
                <span className="eyebrow">{collection?.name ?? "Solenne"}</span>
                <h2 className="font-display text-2xl md:text-3xl text-midnight mt-4 leading-snug">
                  {section.subtitle || "Silk that moves the way you do"}
                </h2>
                <p className="font-voice italic text-lg text-midnight/60 mt-5 max-w-md">
                  {section.description || collection?.description || "Considered pieces for the modern wardrobe."}
                </p>
                <Link
                  to={collection ? `/collections/${collection.id}` : "/collections"}
                  className="mt-8 inline-block font-sans text-[12px] tracking-[0.2em] uppercase text-midnight border-b border-midnight pb-1 hover:text-gold hover:border-gold transition-colors"
                >
                  {section.button_text || "Discover the Edit →"}
                </Link>
              </div>
              <Link to={collection ? `/collections/${collection.id}` : "/collections"} className="order-1 md:order-2 block overflow-hidden bg-ivory-warm">
                <img
                  src={getImageUrl(section.media_url || collection?.image)}
                  alt={section.title}
                  loading="lazy"
                  className="w-full aspect-[4/5] object-cover"
                />
              </Link>
            </div>
          </section>
        </div>
      );

    case "featured_products":
      return (
        <div className="max-w-page mx-auto px-6 md:px-10">
          <section className="py-24 md:py-28 border-t border-line">
            <SectionLabel num={num} title={section.title || "Featured Pieces"} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-14">
              {section.products?.map((p: any) => (
                <ProductCard key={p.id} product={toProduct(p)} />
              ))}
            </div>
            {section.button_text && (
              <div className="text-center mt-14">
                <Link
                  to={section.link || "/shop"}
                  className="inline-block font-sans text-[12px] tracking-[0.2em] uppercase text-midnight border border-line px-8 py-4 hover:border-gold hover:text-gold transition-colors"
                >
                  {section.button_text}
                </Link>
              </div>
            )}
          </section>
        </div>
      );

    case "editorial":
      return (
        <section className="bg-midnight">
          <div className="max-w-page mx-auto px-6 md:px-10 py-24 md:py-28 grid md:grid-cols-2 gap-14 items-center">
            {section.media_url && (
              <img
                src={getImageUrl(section.media_url)}
                alt={section.title}
                loading="lazy"
                className="w-full aspect-[4/5] object-cover order-1"
              />
            )}
            <div className="order-2">
              <span className="font-sans text-[11px] tracking-widest2 uppercase text-gold mb-5 block">
                {section.subtitle || "Our Story"}
              </span>
              <h2 className="font-display text-2xl md:text-3xl text-ivory leading-snug">
                {section.title}
              </h2>
              <p className="font-voice italic text-lg text-ivory/70 mt-6 leading-relaxed max-w-md">
                {section.description}
              </p>
              {section.button_text && (
                <Link
                  to={section.link || "/about"}
                  className="mt-8 inline-block font-sans text-[12px] tracking-[0.2em] uppercase text-ivory border-b border-gold pb-1 hover:text-gold transition-colors"
                >
                  {section.button_text}
                </Link>
              )}
            </div>
          </div>
        </section>
      );

    case "categories":
        return (
            <div className="max-w-page mx-auto px-6 md:px-10">
              <section className="py-24 md:py-28 border-b border-line">
                <SectionLabel num={num} title={section.title || "Categories"} />
                <div className="grid md:grid-cols-3 gap-6">
                  {section.categories?.map((c: any) => {
                    const cat = toCollection(c as any); // Reusing toCollection mapping for simple category display
                    return (
                        <Link key={c.id} to={`/shop?category=${c.slug}`} className="group block">
                            <div className="overflow-hidden bg-ivory-warm">
                            <img
                                src={cat.image}
                                alt={cat.name}
                                loading="lazy"
                                width="900"
                                height="1200"
                                className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                            />
                            </div>
                            <h3 className="font-display text-base text-midnight mt-5">{cat.name}</h3>
                            <p className="font-voice italic text-sm text-midnight/60 mt-1">{c.description}</p>
                        </Link>
                    );
                  })}
                </div>
              </section>
            </div>
        );

    case "banner":
        return (
            <section className="py-12 bg-ivory-warm border-y border-line">
                <div className="max-w-page mx-auto px-6 text-center">
                    <h2 className="font-display text-xl text-midnight">{section.title}</h2>
                    <p className="font-voice italic text-midnight/60 mt-2">{section.description}</p>
                    {section.button_text && (
                        <Link to={section.link || "#"} className="mt-4 inline-block font-sans text-[10px] tracking-widest uppercase border-b border-midnight pb-0.5">
                            {section.button_text}
                        </Link>
                    )}
                </div>
            </section>
        );

    case "lookbook":
        return (
            <div className="max-w-page mx-auto px-6 md:px-10 py-24 border-t border-line">
                <SectionLabel num={num} title={section.title || "Lookbook"} />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {section.gallery?.map((img) => (
                        <div key={img.id} className="aspect-[3/4] overflow-hidden bg-ivory-warm">
                            <img src={getImageUrl(img.url)} className="h-full w-full object-cover transition-transform duration-1000 hover:scale-110" alt="" />
                        </div>
                    ))}
                </div>
            </div>
        );

    default:
      return null;
  }
}
