import { useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import ProductCardSkeleton from "../components/ProductCardSkeleton";
import { useShopCatalog } from "../hooks/useCatalog";
import { useSearchParams } from "react-router-dom";

const sorts = ["Newest", "Price: Low to High", "Price: High to Low"];

export default function Shop() {
  const [params] = useSearchParams();
  const { products, loading, error } = useShopCatalog();
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Newest");

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((product) => product.category)))], [products]);
  const list = useMemo(() => {
    let arr = products.filter((p) => category === "All" || p.category === category);
    if (params.get("filter") === "new") arr = arr.filter((product) => product.isNew);
    if (sort === "Price: Low to High") arr = [...arr].sort((a, b) => a.price - b.price);
    if (sort === "Price: High to Low") arr = [...arr].sort((a, b) => b.price - a.price);
    if (sort === "Newest") arr = [...arr].sort((a, b) => Number(b.isNew) - Number(a.isNew));
    return arr;
  }, [category, params, products, sort]);

  return (
    <div className="max-w-page mx-auto px-6 md:px-10 py-16">
      <div className="text-center mb-14">
        <span className="eyebrow">The Full Edit</span>
        <h1 className="font-display text-3xl md:text-4xl text-midnight mt-4">Shop</h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-6 border-y border-line py-5 mb-12">
        <div className="flex items-center gap-6">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`font-sans text-[12px] tracking-[0.15em] uppercase transition-colors ${
                category === c ? "text-gold" : "text-midnight/60 hover:text-midnight"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-transparent border border-line px-4 py-2 font-sans text-[12px] tracking-[0.1em] uppercase text-midnight focus:outline-none focus:border-gold"
        >
          {sorts.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-16">
        {loading && Array.from({ length: 6 }).map((_, idx) => <ProductCardSkeleton key={idx} />)}
        {error && <p role="alert" className="col-span-full py-16 text-center text-sm text-red-900">{error}</p>}
        {!loading && !error && list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {!loading && !error && list.length === 0 && (
        <p className="text-center font-voice italic text-midnight/50 py-20">
          No pieces match this filter yet.
        </p>
      )}
    </div>
  );
}
