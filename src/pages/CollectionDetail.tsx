import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import { useCollectionDetail } from "../hooks/useCatalog";

export default function CollectionDetail() {
  const { id } = useParams();
  const { collection, collectionProducts, loading, error } = useCollectionDetail(id);

  if (loading) {
    return (
      <div className="mx-auto max-w-page px-6 py-16 md:px-10">
        <div className="max-w-2xl animate-pulse">
          <div className="h-3 bg-line/40 rounded w-24" />
          <div className="h-8 bg-line/60 rounded w-1/2 mt-4" />
          <div className="h-4 bg-line/30 rounded w-3/4 mt-4" />
        </div>
        <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <ProductCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="py-20 text-center">
        <p role="alert" className="text-sm text-red-900">{error || "Collection not found."}</p>
        <Link to="/collections" className="mt-6 inline-block text-sm hover:text-gold">Back to collections</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-page px-6 py-16 md:px-10">
      <div className="max-w-2xl">
        <span className="eyebrow">Collection</span>
        <h1 className="mt-4 font-display text-3xl">{collection.name}</h1>
        <p className="mt-4 text-lg italic text-midnight/60">{collection.tagline}</p>
      </div>
      <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-4">
        {collectionProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {!collectionProducts.length && (
        <div className="py-12 text-center">
          <p className="text-midnight/60">No active products are linked to this collection.</p>
          <p className="mt-2 text-xs text-midnight/40">Check that the product is active and its collection matches this collection.</p>
        </div>
      )}
    </div>
  );
}
