import { memo, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { Product, ProductVariant } from "../types/product";
import { formatDZD } from "../utils/currency";
import { useCart } from "../contexts/CartProvider";
import { useWishlist } from "../contexts/WishlistProvider";

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const [loaded, setLoaded] = useState(false);

  // Group variants by color to show unique colors
  const colorVariants = useMemo(() => {
    const map = new Map<string, ProductVariant>();
    product.variants.forEach(v => {
      if (!map.has(v.name)) map.set(v.name, v);
    });
    return Array.from(map.values());
  }, [product.variants]);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    colorVariants[0] || product.variants[0]
  );

  const displayImage = selectedVariant?.image || product.images[0];
  const secondaryImage =
    product.images.length > 1
      ? product.images.find((img) => img !== displayImage) || product.images[1]
      : undefined;

  const isSoldOut = !product.inStock || selectedVariant?.stock === 0;
  const isWishlisted = has(product.id);

  return (
    <div className="group flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden bg-ivory-warm aspect-[4/5]">
        <Link
          to={`/product/${product.id}`}
          className="block h-full w-full"
          aria-label={`View ${product.name}`}
        >
          {/* Primary image */}
          <img
            key={displayImage}
            src={displayImage}
            alt={`${product.name} — ${selectedVariant?.name}`}
            loading="lazy"
            decoding="async"
            width="400"
            height="500"
            onLoad={() => setLoaded(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[900ms] ease-out group-hover:scale-[1.025] ${
              loaded ? "opacity-100" : "opacity-0"
            } ${secondaryImage ? "group-hover:opacity-0" : ""}`}
            style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
          />

          {/* Secondary image — crossfades in on hover, desktop only */}
          {secondaryImage && (
            <img
              src={secondaryImage}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              width="400"
              height="500"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
            />
          )}
        </Link>

        {/* Editorial badges */}
        {product.isNew && (
          <span className="absolute top-4 left-4 font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-midnight bg-ivory/85 px-2 py-1">
            New Arrival
          </span>
        )}

        {isSoldOut && (
          <span className="absolute top-4 left-4 font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-ivory bg-midnight/75 px-2 py-1">
            Sold Out
          </span>
        )}

        {/* Wishlist */}
        <button
          className={`absolute top-3.5 right-3.5 h-8 w-8 flex items-center justify-center text-midnight transition-opacity duration-300 opacity-80 hover:opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 ${
            isWishlisted ? "md:opacity-100" : ""
          }`}
          aria-label={
            isWishlisted ? "Remove from wishlist" : "Add to wishlist"
          }
          aria-pressed={isWishlisted}
          onClick={(e) => {
            e.preventDefault();
            toggle(product.id);
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={isWishlisted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.1"
          >
            <path d="M12 20s-7.5-4.6-9.6-9.4C1 6.8 3 3.5 6.5 3.5c2 0 3.6 1.3 4.5 2.9.9-1.6 2.5-2.9 4.5-2.9 3.5 0 5.5 3.3 4.1 7.1C19.5 15.4 12 20 12 20z" />
          </svg>
        </button>

        {/* Add to Bag */}
        <div
          className={`absolute inset-x-0 bottom-0 transition-all duration-500 ease-out
            opacity-100 translate-y-0
            md:opacity-0 md:translate-y-1.5 md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-focus-within:opacity-100 md:group-focus-within:translate-y-0`}
        >
          <button
            className="w-full bg-ivory/92 backdrop-blur-[2px] font-sans text-[10px] tracking-[0.18em] uppercase text-midnight py-3 border-t border-midnight/10 transition-colors duration-300 hover:bg-ivory disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={isSoldOut}
            onClick={(e) => {
              e.preventDefault();
              addItem(product, selectedVariant.id);
            }}
          >
            {isSoldOut ? "Out of Stock" : "Add to Bag"}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="pt-4 flex flex-col items-center text-center">
        {colorVariants.length > 1 && (
          <div className="flex gap-2 mb-3.5">
            {colorVariants.map((v) => {
              const isSelected = selectedVariant.name === v.name;
              return (
                <button
                  key={v.name}
                  onClick={() => setSelectedVariant(v)}
                  aria-label={`View ${product.name} in ${v.name}`}
                  aria-pressed={isSelected}
                  className={`relative h-3.5 w-3.5 rounded-full transition-all duration-300 ring-1 ring-offset-2 ring-offset-ivory-warm ${
                    isSelected
                      ? "ring-midnight/70"
                      : "ring-transparent hover:ring-midnight/25"
                  }`}
                  title={v.name}
                >
                  <span
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: v.hex }}
                  />
                </button>
              );
            })}
          </div>
        )}

        <Link to={`/product/${product.id}`}>
          <h3 className="font-display text-[14px] tracking-[0.04em] text-midnight transition-colors duration-300 group-hover:text-gold">
            {product.name}
          </h3>

          <p className="font-voice italic text-[12px] text-midnight/45 mt-1">
            {selectedVariant?.name}
          </p>

          <p className="font-sans text-[12.5px] text-midnight/80 mt-2 tracking-wide">
            {formatDZD(selectedVariant?.price || product.price)}
          </p>
        </Link>
      </div>
    </div>
  );
}

export default memo(ProductCard);
