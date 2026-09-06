import { useEffect, useRef, useState } from "react";
import type { ReactNode, TouchEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { formatDZD } from "../utils/currency";
import ProductCard from "../components/ProductCard";
import { useCart } from "../contexts/CartProvider";
import { useProductDetail } from "../hooks/useCatalog";

type AccordionKey = "details" | "shipping" | "care";

export default function ProductDetail() {
  const { id } = useParams();
  const { product, related, loading, error } = useProductDetail(id);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>();
  const [added, setAdded] = useState(false);
  const [fade, setFade] = useState(false);
  const [openSection, setOpenSection] = useState<AccordionKey | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { addItem } = useCart();
  const touchStartX = useRef<number | null>(null);

  // Reset the "Added to Bag" confirmation after a moment.
  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 2200);
    return () => clearTimeout(t);
  }, [added]);

  // Gentle crossfade whenever the visible image changes.
  useEffect(() => {
    setFade(true);
    const t = setTimeout(() => setFade(false), 350);
    return () => clearTimeout(t);
  }, [activeImage, selectedColor]);

  // Close the lightbox on Escape.
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !product) {
    return <ErrorState message={error} />;
  }

  const activeColor = selectedColor ?? product.colors[0]?.name;
  const activeVariant =
    product.colors.find((color) => color.name === activeColor) ?? product.colors[0];
  const activeImages = activeVariant?.images?.length
    ? activeVariant.images
    : [activeVariant?.image ?? product.images[0]];

  const totalImages = activeImages.length;
  const soldOut = !product.inStock || activeVariant?.stock === 0;
  const lowStock =
    typeof activeVariant?.stock === "number" &&
    activeVariant.stock > 0 &&
    activeVariant.stock <= 5;

  const goToImage = (index: number) => {
    const next = (index + totalImages) % totalImages;
    setActiveImage(next);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      goToImage(activeImage + (delta < 0 ? 1 : -1));
    }
    touchStartX.current = null;
  };

  const toggleSection = (key: AccordionKey) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  // These fields are optional and may not exist on every product's data model —
  // adjust the property names below to match your actual Product type, and each
  // section only renders when real data is present (nothing invented).
  const details = (product as any).details as string[] | undefined;
  const care = (product as any).care as string | undefined;
  const collectionName = (product as any).collection as string | undefined;

  return (
    <div className="max-w-page mx-auto px-6 md:px-10 py-10 md:py-14 pb-28 md:pb-14">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-8 md:mb-12">
        <ol className="flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/40">
          <li>
            <Link to="/shop" className="hover:text-midnight/70 transition-colors">
              Shop
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>{collectionName ?? "Collection"}</li>
          <li aria-hidden="true">/</li>
          <li className="text-midnight/60">{product.name}</li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-20">
        {/* Gallery */}
        <div>
          <div
            className="relative bg-ivory-warm overflow-hidden aspect-[4/5] group cursor-zoom-in"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={() => setLightboxOpen(true)}
          >
            <img
              src={activeImages[activeImage] ?? activeImages[0]}
              alt={`${product.name} — ${activeColor}`}
              decoding="async"
              width="1000"
              height="1250"
              className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.04] ${
                fade ? "opacity-0" : "opacity-100"
              }`}
            />

            {totalImages > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToImage(activeImage - 1);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-lg text-midnight/60 opacity-0 group-hover:opacity-100 hover:text-midnight transition-opacity duration-300"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToImage(activeImage + 1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-lg text-midnight/60 opacity-0 group-hover:opacity-100 hover:text-midnight transition-opacity duration-300"
                >
                  ›
                </button>
                <span className="absolute bottom-4 right-4 font-sans text-[10px] tracking-[0.15em] text-ivory bg-midnight/70 px-2.5 py-1">
                  {String(activeImage + 1).padStart(2, "0")} / {String(totalImages).padStart(2, "0")}
                </span>
              </>
            )}
          </div>

          {totalImages > 1 && (
            <div className="hidden md:flex gap-3 mt-4">
              {activeImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1} of ${totalImages}`}
                  aria-current={activeImage === i}
                  className={`w-20 aspect-[4/5] overflow-hidden border transition-colors ${
                    activeImage === i ? "border-midnight" : "border-line hover:border-midnight/40"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width="80"
                    height="100"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:pt-2">
          <span className="font-sans text-[11px] tracking-[0.25em] uppercase text-gold/80">
            Solenne Collection
          </span>

          <h1 className="font-display text-[28px] md:text-[34px] leading-tight tracking-[0.02em] text-midnight mt-3">
            {product.name}
          </h1>

          <p className="font-voice italic text-lg text-midnight/60 mt-2">{activeColor}</p>

          <p className="font-sans text-xl text-midnight mt-6 tracking-wide">
            {formatDZD(product.price)}
          </p>

          <p className="font-voice text-[16px] text-midnight/70 leading-[1.8] mt-8 max-w-md">
            {product.description}
          </p>

          {product.colors.length > 0 && (
            <div className="mt-10">
              <span className="font-sans text-[11px] tracking-[0.2em] uppercase text-midnight/45">
                Color
              </span>
              <p className="font-voice italic text-[15px] text-midnight mt-1.5">{activeColor}</p>
              <div className="flex gap-3 mt-4" role="group" aria-label="Select color">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      setSelectedColor(c.name);
                      setActiveImage(0);
                    }}
                    aria-label={c.name}
                    aria-pressed={activeColor === c.name}
                    className={`relative w-9 h-9 rounded-full border transition-all duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-midnight ${
                      activeColor === c.name ? "border-midnight" : "border-line hover:border-midnight/40"
                    }`}
                  >
                    <span className="absolute inset-1 rounded-full" style={{ backgroundColor: c.hex }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {lowStock && (
            <p className="font-sans text-[12px] tracking-[0.05em] text-midnight/50 mt-4">
              Only {activeVariant?.stock} {activeVariant?.stock === 1 ? "piece" : "pieces"} remaining
            </p>
          )}

          <button
            disabled={soldOut}
            onClick={() => {
              addItem(product, activeColor);
              setAdded(true);
            }}
            className="mt-9 w-full lg:w-[320px] font-sans text-[12px] tracking-[0.22em] uppercase bg-midnight text-ivory py-4 px-10 transition-colors duration-300 hover:bg-midnight-deep disabled:bg-line disabled:text-midnight/40 disabled:cursor-not-allowed"
          >
            {soldOut ? "Sold Out" : added ? "Added to Bag ✓" : "Add to Bag"}
          </button>

          <div className="mt-10 divide-y divide-line border-t border-line">
            {details && details.length > 0 && (
              <AccordionSection
                title="Details"
                open={openSection === "details"}
                onToggle={() => toggleSection("details")}
              >
                <ul className="space-y-1.5">
                  {details.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </AccordionSection>
            )}

            <AccordionSection
              title="Shipping & Delivery"
              open={openSection === "shipping"}
              onToggle={() => toggleSection("shipping")}
            >
              <p>Free shipping on orders over 5,000 DA</p>
              <p>Cash on delivery available nationwide</p>
              <p>Ships within 2–4 business days</p>
            </AccordionSection>

            {care && (
              <AccordionSection
                title="Care"
                open={openSection === "care"}
                onToggle={() => toggleSection("care")}
              >
                <p>{care}</p>
              </AccordionSection>
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-line">
            <span className="font-sans text-[11px] tracking-[0.2em] uppercase text-midnight/45">
              The Solenne Promise
            </span>
            <p className="font-voice italic text-[15px] text-midnight/65 leading-relaxed mt-3 max-w-sm">
              Thoughtfully selected pieces, chosen for elegant materials and effortless modest style.
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-24 md:mt-32 pt-16 border-t border-line">
          <h2 className="font-display text-2xl text-midnight text-center mb-14">
            Complete the Collection
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-16">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      <div className="text-center mt-16">
        <Link
          to="/shop"
          className="font-sans text-[12px] tracking-[0.2em] uppercase text-midnight/50 hover:text-midnight transition-colors"
        >
          ← Return to Collection
        </Link>
      </div>

      {/* Mobile sticky add-to-bag */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-ivory/95 backdrop-blur border-t border-line px-5 py-3 flex items-center justify-between gap-4 z-30">
        <div className="min-w-0">
          <p className="font-sans text-[11px] tracking-wide text-midnight/50 truncate">{product.name}</p>
          <p className="font-sans text-sm text-midnight">{formatDZD(product.price)}</p>
        </div>
        <button
          disabled={soldOut}
          onClick={() => {
            addItem(product, activeColor);
            setAdded(true);
          }}
          className="shrink-0 font-sans text-[11px] tracking-[0.18em] uppercase bg-midnight text-ivory py-3 px-6 transition-colors disabled:bg-line disabled:text-midnight/40 disabled:cursor-not-allowed"
        >
          {soldOut ? "Sold Out" : added ? "Added ✓" : "Add to Bag"}
        </button>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} full image`}
          className="fixed inset-0 z-50 bg-midnight/95 flex items-center justify-center p-6"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            aria-label="Close full image"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 font-sans text-[11px] tracking-[0.2em] uppercase text-ivory/70 hover:text-ivory transition-colors"
          >
            Close ✕
          </button>
          <img
            src={activeImages[activeImage] ?? activeImages[0]}
            alt={`${product.name} — ${activeColor}`}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

function AccordionSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="py-4">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="font-sans text-[11px] tracking-[0.2em] uppercase text-midnight/70">{title}</span>
        <span className="font-sans text-midnight/40 text-sm" aria-hidden="true">
          {open ? "−" : "+"}
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden font-voice text-[14px] text-midnight/65 leading-relaxed space-y-1">
          {children}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="max-w-page mx-auto px-6 md:px-10 py-10 md:py-14 animate-pulse">
      <div className="h-3 w-40 bg-line/40 rounded mb-10" />
      <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-20">
        <div>
          <div className="bg-ivory-warm aspect-[4/5]" />
          <div className="hidden md:flex gap-3 mt-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-20 aspect-[4/5] bg-ivory-warm/70" />
            ))}
          </div>
        </div>
        <div className="lg:pt-2 space-y-5">
          <div className="h-3 w-32 bg-line/40 rounded" />
          <div className="h-8 bg-line/50 rounded w-3/4" />
          <div className="h-4 bg-line/30 rounded w-1/4" />
          <div className="h-6 bg-line/40 rounded w-1/3 mt-4" />
          <div className="h-16 bg-line/20 rounded w-full mt-6" />
          <div className="h-9 bg-line/50 rounded w-64 mt-8" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message?: string | null }) {
  return (
    <div className="max-w-page mx-auto px-6 md:px-10 py-32 text-center">
      <p className="font-sans text-[11px] tracking-[0.2em] uppercase text-midnight/50">
        Product Unavailable
      </p>
      <p role="alert" className="font-voice italic text-midnight/60 mt-4">
        {message || "We couldn't find this piece."}
      </p>
      <Link
        to="/shop"
        className="mt-8 inline-block font-sans text-[12px] tracking-[0.2em] uppercase text-midnight/60 hover:text-midnight transition-colors"
      >
        Return to Shop
      </Link>
    </div>
  );
}