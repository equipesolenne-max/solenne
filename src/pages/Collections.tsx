import { Link } from "react-router-dom";
import { useCatalog } from "../hooks/useCatalog";
import CollectionCardSkeleton from "../components/CollectionCardSkeleton";

export default function Collections() {
  const { collections, loading, error } = useCatalog();

  return (
    <div className="mx-auto max-w-page px-6 py-16 md:px-10">
      <div className="mb-14 text-center">
        <span className="eyebrow">Explore</span>
        <h1 className="mt-4 font-display text-3xl md:text-4xl">Collections</h1>
      </div>

      {error && <p role="alert" className="py-12 text-center text-sm text-red-900">{error}</p>}
      {!loading && !error && !collections.length && (
        <p className="py-12 text-center text-midnight/60">No collections are available yet.</p>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {loading && Array.from({ length: 3 }).map((_, idx) => <CollectionCardSkeleton key={idx} />)}
        {!loading && collections.map((collection) => (
          <Link key={collection.id} to={`/collections/${collection.id}`} className="group">
            <div className="overflow-hidden bg-ivory-warm">
              <img
                src={collection.image}
                alt={collection.name}
                loading="lazy"
                decoding="async"
                className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
            <h2 className="mt-5 font-display text-lg">{collection.name}</h2>
            <p className="mt-1 text-sm italic text-midnight/60">{collection.tagline}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
