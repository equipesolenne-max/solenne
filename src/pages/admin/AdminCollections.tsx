import { useState } from "react";
import { useAdminCollection } from "../../hooks/useAdminCollection";
import { createAdmin, deleteAdmin, updateAdmin } from "../../api/admin";
import type { CollectionRecord } from "../../types/admin";
import { readableApiError } from "../../services/errorMessage";
import { invalidateCatalogCache } from "../../services/catalog";
import { optimizeImage } from "../../utils/image";

const emptyCollection: CollectionRecord = {
  id: "",
  name: "",
  slug: "",
  description: "",
  active: true,
  image: "",
  product_ids: [],
  created_at: new Date().toISOString().slice(0, 10),
};

export default function AdminCollections() {
  const { data: collections, loading, error, refresh } = useAdminCollection<CollectionRecord>("collections");
  const [form, setForm] = useState<CollectionRecord>(emptyCollection);
  const [file, setFile] = useState<File | null>(null);
  const [actionError, setActionError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("slug", form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    formData.append("description", form.description);
    formData.append("active", String(form.active));
    if (file) {
        const optimizedFile = await optimizeImage(file);
        formData.append("image", optimizedFile);
    }

    setActionError("");
    try {
      if (form.id) await updateAdmin("collections", form.id, formData);
      else await createAdmin("collections", formData);
      invalidateCatalogCache();
      await refresh();
      setForm(emptyCollection);
      setFile(null);
    } catch (reason) {
      setActionError(readableApiError(reason, "Unable to save the collection."));
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this collection?")) return;
    try { await deleteAdmin("collections", id); invalidateCatalogCache(); await refresh(); }
    catch (reason) { setActionError(readableApiError(reason, "Unable to delete the collection.")); }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-[28px] border border-[#1B2A46]/10 bg-[#F8F4EC] p-5">
        <h1 className="font-display text-3xl text-[#1B2A46]">Collections</h1>
        {(loading || error || actionError) && <div className="mt-4 text-sm text-red-900">{loading ? "Loading collections..." : error || actionError}</div>}
        <div className="mt-5 space-y-3">
          {collections.map((collection) => (
            <div key={collection.id} className="flex items-center justify-between rounded-2xl border border-[#1B2A46]/10 bg-[#F3EDE1] p-3">
              <div className="flex items-center gap-4">
                {collection.image && <img src={collection.image} alt="" className="h-10 w-10 rounded-md object-cover" />}
                <div>
                  <div className="font-display text-lg text-[#1B2A46]">{collection.name}</div>
                  <div className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#1B2A46]/60">{collection.active ? "Active" : "Inactive"}</div>
                </div>
              </div>
              <div className="flex gap-3"><button onClick={() => { setForm(collection); setFile(null); }} className="font-sans text-[10px] tracking-[0.18em] uppercase text-[#1B2A46] hover:text-[#C6A369]">Edit</button><button onClick={() => void handleDelete(collection.id)} className="font-sans text-[10px] tracking-[0.18em] uppercase text-[#1B2A46]/60 hover:text-red-800">Delete</button></div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-[#1B2A46]/10 bg-[#F3EDE1] p-5">
        <h2 className="font-display text-2xl text-[#1B2A46]">{form.id ? "Edit collection" : "Create collection"}</h2>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Collection name" className="w-full border border-[#1B2A46]/15 bg-[#F8F4EC] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]" required />
          <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="Slug" className="w-full border border-[#1B2A46]/15 bg-[#F8F4EC] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]" required />
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" rows={4} className="w-full border border-[#1B2A46]/15 bg-[#F8F4EC] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]" />

          <div className="space-y-2">
            <label className="block font-sans text-[10px] tracking-[0.18em] uppercase text-[#1B2A46]/60">Collection image</label>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-xs" />
            {form.image && !file && <p className="text-[10px] text-[#1B2A46]/50">Current: {form.image.split('/').pop()}</p>}
          </div>

          <label className="flex items-center gap-2 font-sans text-[10px] tracking-[0.18em] uppercase text-[#1B2A46]">
            <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
            Active
          </label>
          <button type="submit" className="w-full border border-[#1B2A46] bg-[#1B2A46] px-5 py-3 font-sans text-[11px] tracking-[0.18em] uppercase text-[#F8F4EC] hover:bg-[#101B30]">
            Save collection
          </button>
        </form>
      </section>
    </div>
  );
}
