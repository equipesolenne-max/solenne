import { Link } from "react-router-dom";
import { useWishlist } from "../../contexts/WishlistProvider";
import { useShopCatalog } from "../../hooks/useCatalog";
import ProductCard from "../ProductCard";
import ProductCardSkeleton from "../ProductCardSkeleton";

export default function AccountWishlist() {
  const { ids, loading: wishlistLoading } = useWishlist();
  const { products, loading: catalogLoading, error } = useShopCatalog();

  const loading = wishlistLoading || catalogLoading;
  const savedProducts = products.filter((p) => ids.includes(p.id));

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <span className="eyebrow">Saved</span>
          <h2 className="font-display text-2xl text-midnight mt-1">My Wishlist</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <ProductCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="eyebrow">Saved</span>
        <h2 className="font-display text-2xl text-midnight mt-1">My Wishlist</h2>
        <p className="font-voice italic text-sm text-midnight/60 mt-1">
          Your curated selection of favorite pieces.
        </p>
      </div>

      {error && (
        <div role="alert" className="p-4 border border-red-900/20 bg-red-50 text-sm text-red-900 font-sans">
          {error}
        </div>
      )}

      {savedProducts.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-line bg-ivory-warm/30 p-8">
          <svg className="w-10 h-10 mx-auto text-midnight/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h3 className="font-display text-lg text-midnight">Your wishlist is empty</h3>
          <p className="font-voice italic text-sm text-midnight/60 mt-2 max-w-sm mx-auto">
            Save the pieces you love and find them here anytime.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-block bg-midnight text-ivory font-sans text-[11px] tracking-[0.2em] uppercase px-7 py-3.5 hover:bg-midnight-deep transition-colors"
          >
            Explore Collection →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
          {savedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
