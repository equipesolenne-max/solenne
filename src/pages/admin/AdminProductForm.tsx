import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAdminCollection } from "../../hooks/useAdminCollection";
import { createAdmin, getAdmin, updateAdmin, uploadProductImage } from "../../api/admin";
import { api } from "../../api/client";
import type { ProductRecord, ProductVariant } from "../../types/admin";
import type { CategoryRecord, CollectionRecord } from "../../types/admin";
import { readableApiError } from "../../services/errorMessage";
import { invalidateCatalogCache } from "../../services/catalog";
import { getImageUrl } from "../../utils/image";

const emptyProduct: ProductRecord = {
  id: "",
  name: "",
  slug: "",
  description: "",
  price: 0,
  compare_at_price: 0,
  currency: "DZD",
  category: "Hijabs",
  collection: "The Silk Edit",
  material: "",
  dimensions: "",
  colors: ["Ivory"],
  variants: [{ name: "Ivory", hex: "#F3EDE1", images: [], stock: 0 }],
  stock: 0,
  featured: false,
  bestseller: false,
  is_new: false,
  active: true,
  images: [],
  created_at: new Date().toISOString().slice(0, 10),
};

export default function AdminProductForm() {
  const navigate = useNavigate();
  const params = useParams();
  const productId = params.id;

  const [form, setForm] = useState<ProductRecord>(emptyProduct);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const { data: collectionRecords } = useAdminCollection<CollectionRecord>("collections");
  const { data: categoryRecords } = useAdminCollection<CategoryRecord>("categories");
  const collections = useMemo(() => collectionRecords, [collectionRecords]);
  const categories = useMemo(() => categoryRecords.map((item) => item.name), [categoryRecords]);

  useEffect(() => {
    if (!productId) return;
    void getAdmin<ProductRecord>("products", productId).then((product) => {
      if (product) setForm({ ...product, variants: product.variants?.length ? product.variants : product.colors.map((name) => ({ name, hex: "#C6A369", images: product.images, stock: product.stock })) });
      else setError("Product not found.");
    }).catch((reason) => setError(readableApiError(reason, "Unable to load the product.")));
  }, [productId]);

  function onChange<K extends keyof ProductRecord>(key: K, value: ProductRecord[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateVariant(index: number, changes: Partial<ProductVariant>) {
    setForm((current) => {
      const variants = [...(current.variants ?? [])];
      variants[index] = { ...variants[index], ...changes };
      return { ...current, variants, colors: variants.map((variant) => variant.name) };
    });
  }

  function addVariant() {
    setForm((current) => ({ ...current, variants: [...(current.variants ?? []), { name: "", hex: "#C6A369", images: [], stock: 0 }], colors: [...(current.variants ?? []), { name: "", hex: "#C6A369", images: [], stock: 0 }].map((variant) => variant.name) }));
  }

  function removeVariant(index: number) {
    setForm((current) => {
      const variants = (current.variants ?? []).filter((_, variantIndex) => variantIndex !== index);
      return { ...current, variants, colors: variants.map((variant) => variant.name) };
    });
  }

  async function handleVariantImages(event: React.ChangeEvent<HTMLInputElement>, index: number) {
    if (!productId) {
      alert("Please save the product first before uploading variant images.");
      return;
    }
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setUploading(true); setError("");
    try {
      const variant = form.variants?.[index];
      if (!variant) return;

      const results = await Promise.all(
        files.map((file) => {
          const form = new FormData();
          form.append("image", file);
          form.append("variant_id", variant.id || variant.name);
          return api.post(`/admin/products/${productId}/images/`, form);
        })
      );
      const newImageUrls = results.map((res: any) => res.url);
      updateVariant(index, { images: [...(variant.images ?? []), ...newImageUrls] });
    } catch (reason) {
      setError(readableApiError(reason, "Unable to upload variant images."));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploading(true);
    setError("");

    const nextProduct: ProductRecord = {
      ...form,
      id: form.id,
      slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      created_at: form.created_at || new Date().toISOString().slice(0, 10),
    };

    // Cleanup images field (no longer used for storage, only for UI fallback if needed, but backend ignores it)
    delete (nextProduct as any).images;

    try {
      let savedProduct: ProductRecord;
      if (productId) {
        savedProduct = await updateAdmin("products", nextProduct.id, nextProduct);
      } else {
        savedProduct = await createAdmin("products", nextProduct);
      }
      invalidateCatalogCache();
      if (!productId) {
          navigate(`/admin/products/${savedProduct.id}/edit`);
      } else {
          navigate("/admin/products");
      }
    } catch (reason) {
      setError(readableApiError(reason, "Unable to save the product."));
    } finally { setUploading(false); }
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    if (!productId) {
      alert("Please save the product first before uploading images.");
      return;
    }
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setUploading(true);
    try {
      const results = await Promise.all(files.map((file) => uploadProductImage(productId, file)));
      const newImageUrls = results.map((res: any) => res.url);
      setForm((current) => ({ ...current, images: [...current.images, ...newImageUrls] }));
    } catch (reason) {
      setError(readableApiError(reason, "Unable to upload product images."));
    } finally { setUploading(false); }
  }

  async function deleteProductImage(pmId: string) {
      if (!productId) return;
      try {
          await api.delete(`/admin/products/${productId}/images/${pmId}/`);
          // Refresh form data
          const product = await getAdmin<ProductRecord>("products", productId);
          if (product) setForm({ ...product, variants: product.variants?.length ? product.variants : product.colors.map((name) => ({ name, hex: "#C6A369", images: product.images, stock: product.stock })) });
      } catch (err) {
          setError("Failed to delete image.");
      }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-sans text-[10px] tracking-[0.22em] uppercase text-[#C6A369]">Shop</div>
          <h1 className="mt-2 font-display text-3xl text-[#1B2A46]">{productId ? "Edit product" : "Add product"}</h1>
        </div>
        <Link to="/admin/products" className="font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46] hover:text-[#C6A369]">
          Back to products
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-[28px] border border-[#1B2A46]/10 bg-[#F8F4EC] p-5">
        {error && <div role="alert" className="border border-red-900/20 bg-red-50 p-4 text-sm text-red-900">{error}</div>}
        {!productId && <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800">You will be able to upload images after creating the product.</div>}

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">Product name</label>
            <input value={form.name} onChange={(event) => onChange("name", event.target.value)} className="w-full border border-[#1B2A46]/15 bg-[#F3EDE1] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]" required />
          </div>
          <div>
            <label className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">Slug</label>
            <input value={form.slug} onChange={(event) => onChange("slug", event.target.value)} className="w-full border border-[#1B2A46]/15 bg-[#F3EDE1] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]" required />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">Description</label>
            <textarea value={form.description} onChange={(event) => onChange("description", event.target.value)} rows={5} className="w-full border border-[#1B2A46]/15 bg-[#F3EDE1] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]" required />
          </div>
          <div>
            <label className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">Price</label>
            <input type="number" value={form.price} onChange={(event) => onChange("price", Number(event.target.value))} className="w-full border border-[#1B2A46]/15 bg-[#F3EDE1] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]" required />
          </div>
          <div>
            <label className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">Compare-at price</label>
            <input type="number" value={form.compare_at_price ?? 0} onChange={(event) => onChange("compare_at_price", Number(event.target.value))} className="w-full border border-[#1B2A46]/15 bg-[#F3EDE1] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]" />
          </div>
          <div>
            <label className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">Currency</label>
            <select value={form.currency} onChange={(event) => onChange("currency", event.target.value)} className="w-full border border-[#1B2A46]/15 bg-[#F3EDE1] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]">
              <option value="DZD">DZD</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">Category</label>
            <select value={form.category} onChange={(event) => onChange("category", event.target.value)} className="w-full border border-[#1B2A46]/15 bg-[#F3EDE1] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]">
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">Collection</label>
            <select value={form.collection_id ?? form.collection} onChange={(event) => {
              const selected = collectionRecords.find((item) => item.id === event.target.value || item.name === event.target.value);
              if (selected) setForm((current) => ({ ...current, collection: selected.name, collection_id: selected.id, collection_slug: selected.slug }));
              else onChange("collection", event.target.value);
            }} className="w-full border border-[#1B2A46]/15 bg-[#F3EDE1] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]">
              {collections.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">Material</label>
            <input value={form.material} onChange={(event) => onChange("material", event.target.value)} className="w-full border border-[#1B2A46]/15 bg-[#F3EDE1] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]" />
          </div>
          <div>
            <label className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">Dimensions</label>
            <input value={form.dimensions} onChange={(event) => onChange("dimensions", event.target.value)} className="w-full border border-[#1B2A46]/15 bg-[#F3EDE1] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]" />
          </div>
          <div className="md:col-span-2 rounded-2xl border border-[#1B2A46]/10 bg-[#F3EDE1] p-4">
            <div className="mb-3 flex items-center justify-between"><label className="font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">Color variants</label><button type="button" onClick={addVariant} className="font-sans text-[10px] uppercase tracking-[0.16em] text-[#1B2A46] hover:text-[#C6A369]">Add color</button></div>
            <div className="space-y-4">
              {(form.variants ?? []).map((variant, index) => (
                <div key={`variant-${index}`} className="grid gap-3 border-t border-[#1B2A46]/10 pt-4 md:grid-cols-[1fr_100px_120px_1fr_auto] md:items-end">
                    <label className="text-sm">Color name<input value={variant.name} onChange={(event) => updateVariant(index, { name: event.target.value })} required className="mt-2 w-full border border-[#1B2A46]/15 bg-[#F8F4EC] px-3 py-2 outline-none focus:border-[#C6A369]" /></label>
                    <label className="text-sm">HEX<input type="color" value={variant.hex} onChange={(event) => updateVariant(index, { hex: event.target.value })} className="mt-2 h-10 w-full border border-[#1B2A46]/15 bg-[#F8F4EC] p-1" /></label>
                    <label className="text-sm">Stock<input type="number" min="0" value={variant.stock ?? 0} onChange={(event) => updateVariant(index, { stock: Number(event.target.value) })} className="mt-2 w-full border border-[#1B2A46]/15 bg-[#F8F4EC] px-3 py-2 outline-none focus:border-[#C6A369]" /></label>
                    <label className="text-sm">Images
                        <input type="file" accept="image/*" multiple onChange={(event) => void handleVariantImages(event, index)} disabled={!productId} className="mt-2 block w-full text-xs disabled:opacity-50" />
                        <div className="mt-2 flex gap-2 overflow-x-auto">
                            {variant.images.map((img, i) => (
                                <img key={i} src={getImageUrl(img)} className="h-10 w-10 object-cover rounded border border-line" alt="" />
                            ))}
                        </div>
                    </label>
                    <button type="button" onClick={() => removeVariant(index)} disabled={(form.variants ?? []).length <= 1} className="text-xs text-red-900 disabled:opacity-30">Remove</button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">Stock</label>
            <input type="number" value={form.stock} onChange={(event) => onChange("stock", Number(event.target.value))} className="w-full border border-[#1B2A46]/15 bg-[#F3EDE1] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]" required />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ["featured", "Featured"],
            ["bestseller", "Bestseller"],
            ["is_new", "New"],
            ["active", "Active"],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 rounded-xl border border-[#1B2A46]/10 bg-[#F3EDE1] px-3 py-2 font-sans text-[11px] tracking-[0.14em] uppercase text-[#1B2A46]">
              <input
                type="checkbox"
                checked={Boolean(form[key as keyof ProductRecord])}
                onChange={(event) => onChange(key as keyof ProductRecord, event.target.checked as never)}
              />
              {label}
            </label>
          ))}
        </div>

        <div className="rounded-2xl border border-dashed border-[#1B2A46]/15 bg-[#F3EDE1] p-4">
          <label className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">Product images</label>
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={!productId} className="block w-full text-sm text-[#1B2A46] file:mr-4 file:rounded file:border-0 file:bg-[#1B2A46] file:px-4 file:py-2 file:font-sans file:text-[10px] file:tracking-[0.18em] file:uppercase file:text-[#F8F4EC] disabled:opacity-50" />
          {form.images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {form.images.map((image, index) => (
                <img key={`${image}-${index}`} src={getImageUrl(image)} alt={`Product upload ${index + 1}`} className="h-24 w-full rounded-lg object-cover border border-line" />
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate("/admin/products")} className="border border-[#1B2A46]/15 px-5 py-3 font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]">
            Cancel
          </button>
          <button type="submit" disabled={uploading} className="border border-[#1B2A46] bg-[#1B2A46] px-5 py-3 font-sans text-[11px] tracking-[0.18em] uppercase text-[#F8F4EC] disabled:opacity-70">
            {uploading ? "Saving…" : productId ? "Save changes" : "Create product"}
          </button>
        </div>
      </form>
    </div>
  );
}
