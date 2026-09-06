import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import { performSearch } from "../services/catalog";
import type { Product } from "../types/product";

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = params.get("q");
    if (!q) {
      setResults([]);
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    void performSearch(q)
      .then((data) => {
        if (active) setResults(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Search failed.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params]);

  return (
    <div className="mx-auto max-w-page px-6 py-16 md:px-10">
      <div className="text-center">
        <span className="eyebrow">Find</span>
        <h1 className="mt-4 font-display text-3xl">Search</h1>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setParams(query ? { q: query } : {});
        }}
        className="mx-auto mt-10 flex max-w-xl"
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products"
          className="min-w-0 flex-1 border border-line bg-transparent px-4 py-3 outline-none focus:border-gold"
        />
        <button className="bg-midnight px-6 text-xs uppercase tracking-[0.15em] text-ivory">Search</button>
      </form>

      {error && <p role="alert" className="py-16 text-center text-sm text-red-900">{error}</p>}

      <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-4">
        {loading && Array.from({ length: 4 }).map((_, idx) => <ProductCardSkeleton key={idx} />)}
        {!loading && results.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {!loading && !error && params.get("q") && !results.length && (
        <p className="py-16 text-center text-midnight/60">No products match your search.</p>
      )}
    </div>
  );
}
