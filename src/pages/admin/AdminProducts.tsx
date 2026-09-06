import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminCollection } from "../../hooks/useAdminCollection";
import { deleteAdmin, getSettings, updateAdmin, updateStock } from "../../api/admin";
import type { ProductRecord, CategoryRecord, StoreSettings } from "../../types/admin";
import { defaultSettings } from "../../data/adminMockData";
import { readableApiError } from "../../services/errorMessage";
import { getImageUrl } from "../../utils/image";

export default function AdminProducts() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: allProducts, loading, error, refresh } = useAdminCollection<ProductRecord>("products");
  const { data: categoryRecords } = useAdminCollection<CategoryRecord>("categories");
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    void getSettings().then((value) => {
      if (value && Object.keys(value).length > 0) setSettings(value);
    });
  }, []);

  const products = useMemo(() => {
    return allProducts.filter((product) => {
      const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase()) ||
                          product.category.toLowerCase().includes(query.toLowerCase()) ||
                          product.slug.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "all" || (status === "active" ? product.active : !product.active);
      const matchesCategory = category === "all" || product.category === category;
      return matchesQuery && matchesStatus && matchesCategory;
    }).sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  }, [allProducts, category, query, status]);

  const categories = useMemo(() => categoryRecords.map((item) => item.name), [categoryRecords]);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this piece from the collection?")) return;
    setActionError("");
    try { await deleteAdmin("products", id); await refresh(); }
    catch (reason) { setActionError(readableApiError(reason, "Unable to delete the product.")); }
  }

  async function toggleStatus(product: ProductRecord) {
    setUpdatingId(product.id);
    try {
      await updateAdmin("products", product.id, { active: !product.active });
      await refresh();
    } catch (err) {
      setActionError("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  async function quickUpdateStock(id: string, currentStock: number) {
    const newStockStr = window.prompt("Enter new stock level:", String(currentStock));
    if (newStockStr === null) return;
    const newStock = parseInt(newStockStr, 10);
    if (isNaN(newStock)) return;

    setUpdatingId(id);
    try {
      await updateStock(id, newStock);
      await refresh();
    } catch (err) {
      setActionError("Failed to update stock");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-midnight tracking-tight">Collection</h1>
          <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/40 mt-1">Manage your catalog and inventory</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center bg-midnight px-8 py-3 rounded-full font-sans text-[10px] tracking-[0.2em] uppercase text-ivory hover:bg-midnight-deep transition-all shadow-lg shadow-midnight/10"
        >
          Add new piece
        </Link>
      </div>

      <div className="bg-white rounded-[32px] border border-line p-6 shadow-sm space-y-6">
        <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="relative">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, category..."
              className="w-full bg-ivory-warm/20 border border-line rounded-2xl px-5 py-2.5 text-xs font-sans focus:ring-1 focus:ring-gold/30 outline-none transition-all"
            />
             <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-midnight/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="bg-white border border-line rounded-2xl px-5 py-2.5 text-[10px] tracking-[0.15em] uppercase font-sans focus:ring-1 focus:ring-gold/30 outline-none transition-all cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="bg-white border border-line rounded-2xl px-5 py-2.5 text-[10px] tracking-[0.15em] uppercase font-sans focus:ring-1 focus:ring-gold/30 outline-none transition-all cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          {(error || actionError) && (
            <div role="alert" className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-[11px] text-rose-600 font-sans uppercase tracking-widest flex items-center justify-between">
              <span>{error || actionError}</span>
              <button onClick={() => setActionError("")}>✕</button>
            </div>
          )}

          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-line text-midnight/40">
                <th className="pb-4 font-sans text-[9px] tracking-[0.2em] uppercase">Piece</th>
                <th className="pb-4 font-sans text-[9px] tracking-[0.2em] uppercase">Category</th>
                <th className="pb-4 font-sans text-[9px] tracking-[0.2em] uppercase text-right">Price</th>
                <th className="pb-4 font-sans text-[9px] tracking-[0.2em] uppercase text-center">Stock</th>
                <th className="pb-4 font-sans text-[9px] tracking-[0.2em] uppercase text-center">Status</th>
                <th className="pb-4 pr-2 font-sans text-[9px] tracking-[0.2em] uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              {products.map((product) => (
                <tr key={product.id} className="group hover:bg-ivory-warm/10 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-line/50">
                        <img src={getImageUrl(product.images[0])} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <Link to={`/admin/products/${product.id}/edit`} className="font-display text-sm text-midnight hover:text-gold transition-colors block truncate">{product.name}</Link>
                        <div className="font-sans text-[9px] uppercase tracking-[0.15em] text-midnight/30 truncate">{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-sans text-[11px] uppercase tracking-wider text-midnight/60">{product.category}</td>
                  <td className="py-4 font-sans text-sm text-midnight text-right">{product.price.toLocaleString("fr-FR")} {settings.currency}</td>
                  <td className="py-4 text-center">
                    <button
                      onClick={() => quickUpdateStock(product.id, product.stock)}
                      className={`font-sans text-[11px] font-bold px-3 py-1 rounded-lg transition-colors ${
                        product.stock <= settings.lowStockThreshold ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-ivory-warm/40 text-midnight/40 hover:bg-ivory-warm'
                      }`}
                    >
                      {product.stock}
                    </button>
                  </td>
                  <td className="py-4 text-center">
                    <button
                      disabled={updatingId === product.id}
                      onClick={() => toggleStatus(product)}
                      className={`inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-all ${
                        product.active ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-50 text-gray-400 border-gray-100"
                      }`}
                    >
                      {product.active ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="py-4 pr-2 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/admin/products/${product.id}/edit`} className="text-midnight/40 hover:text-midnight">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </Link>
                      <button onClick={() => void handleDelete(product.id)} className="text-midnight/20 hover:text-rose-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && allProducts.length === 0 && (
            <div className="p-20 flex flex-col items-center justify-center text-midnight/20">
              <div className="animate-spin w-8 h-8 border-t-2 border-midnight rounded-full mb-4" />
              <p className="font-voice italic">Reviewing inventory...</p>
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="p-20 text-center text-midnight/30 font-voice italic">
              No pieces match your current search filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

