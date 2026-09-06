import React, { useState, useEffect, useMemo } from "react";
import { useAdminCollection } from "../../hooks/useAdminCollection";
import { updateStock, getSettings, updateVariant } from "../../api/admin";
import { getInventoryStatus } from "../../services/adminData";
import { getImageUrl } from "../../utils/image";
import type { ProductRecord, StoreSettings } from "../../types/admin";
import { defaultSettings } from "../../data/adminMockData";

export default function AdminInventory() {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const { data: initialProducts, loading, error } = useAdminCollection<ProductRecord>("products");
  const [query, setQuery] = useState("");
  const [localProducts, setLocalProducts] = useState<ProductRecord[]>([]);

  useEffect(() => {
    setLocalProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    void getSettings().then((value) => {
      if (value && Object.keys(value).length > 0) setSettings(value);
    });
  }, []);

  const filteredProducts = useMemo(() => {
    if (!query) return localProducts;
    const q = query.toLowerCase();
    return localProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }, [localProducts, query]);

  const updateProductStock = (productId: string, nextStock: number) => {
    setLocalProducts((current) =>
      current.map((product) =>
        product.id === productId ? { ...product, stock: nextStock } : product
      )
    );
    void updateStock(productId, nextStock);
  };

  const updateVariantStock = (productId: string, variantName: string, nextStock: number) => {
    setLocalProducts((current) =>
      current.map((product) => {
        if (product.id !== productId) return product;
        const nextVariants = (product.variants || []).map((v) =>
          v.name === variantName ? { ...v, stock: nextStock } : v
        );
        const totalStock = nextVariants.reduce((sum, v) => sum + (v.stock || 0), 0);

        void updateVariant(productId, { name: variantName, stock: nextStock });
        return { ...product, variants: nextVariants, stock: totalStock };
      })
    );
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-midnight tracking-tight">Stock Controls</h1>
          <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/40 mt-1">Precise inventory management across the collection</p>
        </div>
        <div className="bg-white rounded-2xl border border-line px-6 py-3 shadow-sm flex items-center gap-4">
          <div className="font-sans text-[9px] tracking-[0.18em] uppercase text-midnight/40">Threshold</div>
          <div className="font-display text-xl text-midnight">{settings.lowStockThreshold} units</div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-line p-6 shadow-sm space-y-6">
        <div className="relative max-w-md">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search piece to update..."
              className="w-full bg-ivory-warm/20 border border-line rounded-2xl px-5 py-2.5 text-xs font-sans focus:ring-1 focus:ring-gold/30 outline-none transition-all"
            />
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-midnight/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-line text-midnight/40">
                <th className="pb-4 pl-2 font-sans text-[9px] tracking-[0.2em] uppercase">Product Details</th>
                <th className="pb-4 font-sans text-[9px] tracking-[0.2em] uppercase w-48">Stock Level</th>
                <th className="pb-4 pr-2 font-sans text-[9px] tracking-[0.2em] uppercase text-right">Inventory Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              {filteredProducts.map((product) => (
                <React.Fragment key={product.id}>
                  {/* Main Product Row */}
                  <tr className="group hover:bg-ivory-warm/5 transition-colors">
                    <td className="py-5 pl-2">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-ivory-warm border border-line/50 overflow-hidden">
                           <img src={getImageUrl(product.images?.[0])} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-display text-base text-midnight">{product.name}</div>
                          <div className="font-sans text-[9px] uppercase tracking-widest text-midnight/40">{product.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5">
                      {!product.variants?.length ? (
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            value={product.stock}
                            onChange={(event) => updateProductStock(product.id, Number(event.target.value))}
                            className="w-24 bg-white border border-line rounded-xl px-3 py-2 text-sm font-sans text-midnight focus:ring-1 focus:ring-gold/30 outline-none transition-all"
                          />
                          <span className="absolute right-[-24px] top-1/2 -translate-y-1/2 text-[10px] text-midnight/20 font-sans uppercase">qty</span>
                        </div>
                      ) : (
                        <span className="font-voice text-[11px] text-midnight/30 italic">Variant tracked</span>
                      )}
                    </td>
                    <td className="py-5 pr-2 text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                        getInventoryStatus(product.stock, settings.lowStockThreshold) === "In Stock"
                          ? "bg-green-50 text-green-600 border-green-100"
                          : getInventoryStatus(product.stock, settings.lowStockThreshold) === "Low Stock"
                            ? "bg-amber-50 text-amber-600 border-amber-200"
                            : "bg-rose-50 text-rose-600 border-rose-200"
                      }`}>
                        {getInventoryStatus(product.stock, settings.lowStockThreshold)}
                      </span>
                    </td>
                  </tr>

                  {/* Variant Rows */}
                  {(product.variants || []).map((variant) => (
                    <tr key={`${product.id}-${variant.name}`} className="bg-ivory-warm/20 border-b border-line/30 group transition-colors hover:bg-ivory-warm/30">
                      <td className="py-3 pl-14">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full border border-line/50" style={{ backgroundColor: variant.hex }} />
                          <span className="font-sans text-[11px] tracking-widest uppercase text-midnight/60">{variant.name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <input
                          type="number"
                          min={0}
                          value={variant.stock ?? 0}
                          onChange={(event) => updateVariantStock(product.id, variant.name, Number(event.target.value))}
                          className="w-20 bg-white/60 border border-line/50 rounded-lg px-2 py-1.5 text-xs font-sans text-midnight focus:ring-1 focus:ring-gold/30 outline-none transition-all"
                        />
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <span className={`font-sans text-[8px] tracking-[0.15em] uppercase font-bold ${
                          (variant.stock ?? 0) <= settings.lowStockThreshold ? "text-amber-500" : "text-midnight/20"
                        }`}>
                          {(variant.stock ?? 0) <= 0 ? "Empty" : (variant.stock ?? 0) <= settings.lowStockThreshold ? "Critical" : "Healthy"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {loading && (
            <div className="p-20 flex flex-col items-center justify-center text-midnight/20">
              <div className="animate-spin w-8 h-8 border-t-2 border-midnight rounded-full mb-4" />
              <p className="font-voice italic">Stock audit in progress...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

