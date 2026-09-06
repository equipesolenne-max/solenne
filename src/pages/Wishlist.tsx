import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import { useShopCatalog } from "../hooks/useCatalog";
import { useWishlist } from "../contexts/WishlistProvider";
import { useUserAuth } from "../contexts/UserAuthProvider";

export default function Wishlist() {
  const { user } = useUserAuth();
  const { ids, loading: wishlistLoading } = useWishlist();
  const { products, loading, error } = useShopCatalog();

  const saved = products.filter((product) => ids.includes(product.id));

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="font-display text-3xl">Save your favorite pieces</h1>
        <p className="mt-4 text-midnight/60">Sign in to keep a wishlist across your devices.</p>
        <Link to="/login" className="mt-8 inline-block bg-midnight px-6 py-4 text-xs uppercase tracking-[0.2em] text-ivory">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-page px-6 py-16 md:px-10">
      <div className="text-center">
        <span className="eyebrow">Saved</span>
        <h1 className="mt-4 font-display text-3xl">Wishlist</h1>
      </div>

      {error && <p role="alert" className="py-16 text-center text-sm text-red-900">{error}</p>}

      <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-4">
        {(loading || wishlistLoading) && Array.from({ length: 4 }).map((_, idx) => <ProductCardSkeleton key={idx} />)}
        {!loading && !wishlistLoading && saved.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {!loading && !wishlistLoading && !error && !saved.length && (
        <div className="py-16 text-center">
          <p className="text-midnight/60">Your wishlist is empty.</p>
          <Link to="/shop" className="mt-7 inline-block bg-midnight px-6 py-4 text-xs uppercase tracking-[0.2em] text-ivory">
            Explore the shop
          </Link>
        </div>
      )}
    </div>
  );
}
