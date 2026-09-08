import { useEffect, useRef, useState, useMemo } from "react";
import type { ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { formatDZD } from "../utils/currency";
import ProductCard from "../components/ProductCard";
import { useCart } from "../contexts/CartProvider";
import { useWishlist } from "../contexts/WishlistProvider";
import { useProductDetail } from "../hooks/useCatalog";
import type { ProductVariant } from "../types/product";

type AccordionKey = "description" | "details" | "shipping" | "care";

export default function ProductDetail() {
  const { id } = useParams();
  const { product, related, loading, error } = useProductDetail(id);

  // Selection state
  const [selectedColor, setSelectedColor] = useState<string>();
  const [selectedSize, setSelectedSize] = useState<string>();
  const [quantity, setQuantity] = useState(1);

  // UI state
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [fade, setFade] = useState(false);
  const [openSection, setOpenSection] = useState<AccordionKey | null>("description");
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { addItem } = useCart();
  const { toggle: toggleWishlist, has: inWishlist } = useWishlist();
  const touchStartX = useRef<number | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Recently Viewed Logic
  useEffect(() => {
    if (product) {
      const recentlyViewed = JSON.parse(localStorage.getItem("solenne-recent") ?? "[]") as string[];
      const filtered = [product.id, ...recentlyViewed.filter(id => id !== product.id)].slice(0, 8);
      localStorage.setItem("solenne-recent", JSON.stringify(filtered));
    }
  }, [product]);

  // Group variants by color
  const colorGroups = useMemo(() => {
    if (!product) return {};
    return product.variants.reduce((acc, v) => {
      if (!acc[v.name]) acc[v.name] = [];
      acc[v.name].push(v);
      return acc;
    }, {} as Record<string, ProductVariant[]>);
  }, [product]);

  const colors = useMemo(() => Object.keys(colorGroups), [colorGroups]);

  // Initialize selection
  useEffect(() => {
    if (product && !selectedColor) {
      const firstColor = colors[0];
      setSelectedColor(firstColor);
      if (firstColor) {
        const firstVariant = colorGroups[firstColor][0];
        if (firstVariant.size) {
          // Don't auto-select size if there are multiple, let user choose
          if (colorGroups[firstColor].length === 1) {
            setSelectedSize(firstVariant.size);
          }
        }
      }
    }
  }, [product, colors, colorGroups, selectedColor]);

  // Reset image when color changes
  useEffect(() => {
    setActiveImage(0);
  }, [selectedColor]);

  // Transitions
  useEffect(() => {
    setFade(true);
    const t = setTimeout(() => setFade(false), 300);
    return () => clearTimeout(t);
  }, [activeImage, selectedColor]);

  // Lightbox Escape key
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  if (loading) return <LoadingState />;
  if (error || !product) return <ErrorState message={error} />;

  // Current selection derived data
  const currentVariants = selectedColor ? colorGroups[selectedColor] : [];
  const selectedVariant = currentVariants.find(v => !v.size || v.size === selectedSize) || currentVariants[0];

  const activeImages = selectedVariant?.images?.length
    ? selectedVariant.images
    : (product.images.length > 0 ? product.images : [selectedVariant?.image]);

  const displayPrice = selectedVariant?.price || product.price;
  const displayComparePrice = selectedVariant?.compareAtPrice || product.compareAtPrice;
  const currentStock = selectedVariant?.stock ?? 0;
  const soldOut = !product.inStock || currentStock === 0;

  const handleAddToCart = async () => {
    if (soldOut || isAdding) return;

    // Validation
    if (currentVariants.some(v => v.size) && !selectedSize) {
      alert("Veuillez sélectionner une taille.");
      return;
    }

    setIsAdding(true);
    addItem(product, selectedVariant.id, quantity);

    // Simulate premium interaction
    setTimeout(() => {
      setIsAdding(false);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }, 600);
  };

  const goToImage = (index: number) => {
    const total = activeImages.length;
    setActiveImage((index + total) % total);
  };

  return (
    <div className="bg-ivory/30 min-h-screen">
      <div className="max-w-page mx-auto px-6 md:px-10 py-8 md:py-12">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-8 hidden md:block">
          <ol className="flex items-center gap-2 font-sans text-[10px] tracking-widest2 uppercase text-midnight/40">
            <li><Link to="/" className="hover:text-midnight transition-colors">Accueil</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link to="/shop" className="hover:text-midnight transition-colors">{product.category}</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-midnight/70">{product.name}</li>
          </ol>
        </nav>

        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-24 items-start">

          {/* 1. PREMIUM PRODUCT GALLERY */}
          <div className="flex flex-col md:flex-row-reverse gap-4 sticky top-24">
            {/* Main Image */}
            <div
              ref={galleryRef}
              className="relative flex-1 bg-ivory-warm aspect-[4/5] overflow-hidden group cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
              onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
              onTouchEnd={(e) => {
                if (touchStartX.current === null) return;
                const delta = e.changedTouches[0].clientX - touchStartX.current;
                if (Math.abs(delta) > 50) goToImage(activeImage + (delta < 0 ? 1 : -1));
                touchStartX.current = null;
              }}
            >
              <img
                src={activeImages[activeImage]}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${fade ? "opacity-0" : "opacity-100"}`}
              />

              {/* Navigation Arrows */}
              <button
                onClick={(e) => { e.stopPropagation(); goToImage(activeImage - 1); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-ivory/80 text-midnight opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goToImage(activeImage + 1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-ivory/80 text-midnight opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ›
              </button>

              {/* Counter */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0">
                <span className="font-sans text-[10px] tracking-widest uppercase bg-midnight/80 text-ivory px-3 py-1.5 backdrop-blur-sm">
                  {activeImage + 1} / {activeImages.length}
                </span>
              </div>
            </div>

            {/* Vertical Thumbnails (Desktop) */}
            <div className="hidden md:flex flex-col gap-3 w-20 max-h-[600px] overflow-y-auto no-scrollbar">
              {activeImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-[4/5] border transition-all duration-300 ${activeImage === i ? "border-midnight" : "border-transparent hover:border-midnight/30"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Pagination Dots (Mobile) */}
            <div className="flex md:hidden justify-center gap-2 mt-2">
              {activeImages.map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${activeImage === i ? "bg-midnight w-4" : "bg-midnight/20"}`} />
              ))}
            </div>
          </div>

          {/* PRODUCT INFO */}
          <div className="flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-sans text-[11px] tracking-widest2 uppercase text-gold mb-2">
                  {product.collection || "Solenne Collection"}
                </p>
                <h1 className="font-display text-3xl md:text-4xl text-midnight tracking-tight mb-4">
                  {product.name}
                </h1>
              </div>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2 transition-colors ${inWishlist(product.id) ? "text-gold" : "text-midnight/30 hover:text-midnight"}`}
                aria-label="Add to wishlist"
              >
                <svg className="w-6 h-6" fill={inWishlist(product.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            <div className="flex items-baseline gap-4 mb-8">
              <span className="font-sans text-2xl text-midnight">{formatDZD(displayPrice)}</span>
              {displayComparePrice !== undefined && displayComparePrice > displayPrice && (
                <span className="font-sans text-lg text-midnight/30 line-through">{formatDZD(displayComparePrice)}</span>
              )}
            </div>

            {/* 2. COLOR SELECTOR */}
            {colors.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                  <span className="font-sans text-[11px] tracking-widest uppercase text-midnight/50">Couleur</span>
                  <span className="font-voice italic text-[15px] text-midnight">{selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {colors.map(colorName => {
                    const variant = colorGroups[colorName][0];
                    return (
                      <button
                        key={colorName}
                        onClick={() => { setSelectedColor(colorName); setSelectedSize(undefined); }}
                        className={`group relative flex flex-col items-center gap-2`}
                        aria-label={colorName}
                      >
                        <div className={`w-10 h-10 rounded-full p-0.5 border transition-all duration-300 ${selectedColor === colorName ? "border-midnight" : "border-transparent group-hover:border-midnight/30"}`}>
                          <div
                            className="w-full h-full rounded-full"
                            style={{ backgroundColor: variant.hex }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. SIZE SELECTOR */}
            {currentVariants.some(v => v.size) && (
              <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                  <span className="font-sans text-[11px] tracking-widest uppercase text-midnight/50">Taille</span>
                  <button className="font-sans text-[10px] tracking-widest uppercase text-gold hover:underline">Guide des tailles</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {currentVariants.map(v => (
                    <button
                      key={v.id}
                      disabled={v.stock === 0}
                      onClick={() => setSelectedSize(v.size)}
                      className={`min-w-[56px] h-12 flex items-center justify-center border px-4 font-sans text-xs tracking-widest uppercase transition-all
                        ${selectedSize === v.size ? "bg-midnight text-ivory border-midnight" : "bg-transparent text-midnight border-line hover:border-midnight/40"}
                        ${v.stock === 0 ? "opacity-30 cursor-not-allowed diagonal-strike" : ""}
                      `}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 8. QUANTITY & 4. STOCK */}
            <div className="flex flex-col gap-6 mb-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center border border-line h-14 px-4 bg-white/50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-full flex items-center justify-center text-midnight/40 hover:text-midnight transition-colors"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-sans text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className="w-8 h-full flex items-center justify-center text-midnight/40 hover:text-midnight transition-colors"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  {soldOut ? (
                    <span className="font-sans text-[11px] tracking-widest uppercase text-red-500">Rupture de stock</span>
                  ) : currentStock <= 5 ? (
                    <span className="font-sans text-[11px] tracking-widest uppercase text-gold">Plus que {currentStock} disponibles</span>
                  ) : (
                    <span className="font-sans text-[11px] tracking-widest uppercase text-green-600">En stock</span>
                  )}
                </div>
              </div>

              {/* 7. ADD TO CART */}
              <button
                disabled={soldOut || isAdding}
                onClick={handleAddToCart}
                className={`relative w-full h-16 font-sans text-[12px] tracking-[0.25em] uppercase transition-all duration-500 overflow-hidden
                  ${soldOut ? "bg-line text-midnight/30 cursor-not-allowed" : "bg-midnight text-ivory hover:bg-midnight-deep shadow-lg hover:shadow-midnight/10"}
                `}
              >
                <span className={`flex items-center justify-center gap-3 transition-all duration-300 ${isAdding ? "translate-y-12" : "translate-y-0"}`}>
                  {added ? "Ajouté ✓" : "Ajouter au Panier"}
                </span>
                {isAdding && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-ivory/30 border-t-ivory rounded-full animate-spin" />
                  </div>
                )}
              </button>
            </div>

            {/* 11. SHIPPING SHORT INFO */}
            <div className="flex items-center gap-4 py-6 border-y border-line mb-8 text-midnight/60">
              <div className="flex-1 flex flex-col items-center text-center px-2">
                <svg className="w-5 h-5 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" strokeWidth="1.2" />
                </svg>
                <span className="font-sans text-[9px] tracking-widest uppercase">Livraison 48 Wilayas</span>
              </div>
              <div className="w-px h-10 bg-line" />
              <div className="flex-1 flex flex-col items-center text-center px-2">
                <svg className="w-5 h-5 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" strokeWidth="1.2" />
                </svg>
                <span className="font-sans text-[9px] tracking-widest uppercase">Paiement à la livraison</span>
              </div>
              <div className="w-px h-10 bg-line" />
              <div className="flex-1 flex flex-col items-center text-center px-2">
                <svg className="w-5 h-5 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="1.2" />
                </svg>
                <span className="font-sans text-[9px] tracking-widest uppercase">Qualité Premium</span>
              </div>
            </div>

            {/* 10. ACCORDIONS */}
            <div className="divide-y divide-line">
              <Accordion
                title="Description"
                isOpen={openSection === "description"}
                onClick={() => setOpenSection(openSection === "description" ? null : "description")}
              >
                <p className="font-voice text-lg leading-relaxed text-midnight/70 italic mb-4">
                  {product.description}
                </p>
                {product.material && (
                  <p className="font-sans text-xs tracking-wider text-midnight/60">
                    <span className="text-midnight/80 font-medium">Matière:</span> {product.material}
                  </p>
                )}
                {product.dimensions && (
                  <p className="font-sans text-xs tracking-wider text-midnight/60 mt-1">
                    <span className="text-midnight/80 font-medium">Dimensions:</span> {product.dimensions}
                  </p>
                )}
              </Accordion>

              {product.details && product.details.length > 0 && (
                <Accordion
                  title="Détails"
                  isOpen={openSection === "details"}
                  onClick={() => setOpenSection(openSection === "details" ? null : "details")}
                >
                  <ul className="list-disc list-inside space-y-2 font-voice text-[17px] text-midnight/70">
                    {product.details.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                </Accordion>
              )}

              <Accordion
                title="Livraison & Retours"
                isOpen={openSection === "shipping"}
                onClick={() => setOpenSection(openSection === "shipping" ? null : "shipping")}
              >
                <div className="font-voice text-[17px] text-midnight/70 space-y-3">
                  <p>• Livraison à domicile dans toutes les wilayas d'Algérie.</p>
                  <p>• Délais: 2-5 jours ouvrables selon la destination.</p>
                  <p>• Paiement sécurisé à la livraison (Cash on Delivery).</p>
                  <p>• Retours acceptés sous 7 jours en cas de défaut de fabrication.</p>
                </div>
              </Accordion>

              {product.care && (
                <Accordion
                  title="Entretien"
                  isOpen={openSection === "care"}
                  onClick={() => setOpenSection(openSection === "care" ? null : "care")}
                >
                  <p className="font-voice text-[17px] text-midnight/70">{product.care}</p>
                </Accordion>
              )}
            </div>
          </div>
        </div>

        {/* 12. RELATED PRODUCTS */}
        {related.length > 0 && (
          <div className="mt-32 pt-20 border-t border-line">
            <h2 className="font-display text-2xl md:text-3xl text-midnight text-center mb-16 tracking-tight">
              Vous pourriez aussi aimer
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 14. MOBILE STICKY BAR */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-ivory/95 backdrop-blur-md border-t border-line px-6 py-4 flex items-center justify-between gap-6 z-40 safe-bottom">
        <div className="flex flex-col min-w-0">
          <span className="font-sans text-[10px] tracking-widest uppercase text-midnight/40 truncate">{product.name}</span>
          <span className="font-sans text-sm font-medium text-midnight">{formatDZD(displayPrice)}</span>
        </div>
        <button
          disabled={soldOut || isAdding}
          onClick={handleAddToCart}
          className="shrink-0 bg-midnight text-ivory font-sans text-[10px] tracking-widest uppercase px-6 py-3.5 shadow-lg active:scale-95 transition-all disabled:bg-line disabled:text-midnight/30"
        >
          {soldOut ? "Épuisé" : added ? "Ajouté ✓" : "Ajouter"}
        </button>
      </div>

      {/* LIGHTBOX */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[60] bg-midnight flex flex-col items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button className="absolute top-8 right-8 text-ivory/60 hover:text-ivory text-xs tracking-widest uppercase font-sans">
            Fermer ✕
          </button>

          <div className="w-full h-full p-6 flex items-center justify-center" onClick={e => e.stopPropagation()}>
             <img
              src={activeImages[activeImage]}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="absolute bottom-8 flex gap-4">
             <button onClick={() => goToImage(activeImage - 1)} className="w-12 h-12 flex items-center justify-center rounded-full bg-ivory/10 text-ivory hover:bg-ivory/20 transition-colors">‹</button>
             <button onClick={() => goToImage(activeImage + 1)} className="w-12 h-12 flex items-center justify-center rounded-full bg-ivory/10 text-ivory hover:bg-ivory/20 transition-colors">›</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Accordion({ title, isOpen, onClick, children }: { title: string; isOpen: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <div className="py-2">
      <button
        onClick={onClick}
        className="w-full flex justify-between items-center py-5 text-left group"
      >
        <span className="font-sans text-[11px] tracking-widest2 uppercase text-midnight/80 group-hover:text-midnight transition-colors">{title}</span>
        <span className={`text-midnight/30 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v12M6 12h12" strokeWidth="1.2" /></svg>
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-[500px] pb-8 opacity-100" : "max-h-0 opacity-0"}`}>
        {children}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="max-w-page mx-auto px-6 md:px-10 py-20 animate-pulse">
      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-20">
        <div className="aspect-[4/5] bg-ivory-warm rounded" />
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="h-4 w-24 bg-ivory-warm rounded" />
            <div className="h-10 w-3/4 bg-ivory-warm rounded" />
            <div className="h-6 w-32 bg-ivory-warm rounded" />
          </div>
          <div className="h-40 w-full bg-ivory-warm rounded" />
          <div className="h-16 w-64 bg-ivory-warm rounded" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message?: string | null }) {
  return (
    <div className="max-w-page mx-auto px-6 py-40 text-center">
      <h2 className="font-display text-2xl text-midnight mb-4">Oups ! Une erreur est survenue</h2>
      <p className="font-voice text-lg text-midnight/60 mb-8">{message || "Produit introuvable."}</p>
      <Link to="/shop" className="font-sans text-xs tracking-widest uppercase bg-midnight text-ivory px-8 py-4">Retour à la boutique</Link>
    </div>
  );
}
