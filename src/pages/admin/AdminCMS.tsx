import { useState, useMemo } from "react";
import { useAdminCollection } from "../../hooks/useAdminCollection";
import { createAdmin, deleteAdmin, updateAdmin } from "../../api/admin";
import { api } from "../../api/client";
import type { HomeSectionRecord, HomeSectionType, ProductRecord, CategoryRecord, CollectionRecord } from "../../types/admin";
import { readableApiError } from "../../services/errorMessage";
import { getImageUrl, optimizeImage } from "../../utils/image";

const SECTION_TYPES: Record<HomeSectionType, string> = {
  hero: "Hero Slide",
  featured_products: "Featured Products",
  featured_collection: "Featured Collection",
  categories: "Categories Grid",
  banner: "Promotional Banner",
  editorial: "Editorial / Story",
  lookbook: "Lookbook Gallery",
  custom: "Custom Section",
};

const emptySection: Partial<HomeSectionRecord> = {
  section_type: "hero",
  title: "",
  subtitle: "",
  description: "",
  button_text: "",
  link: "",
  is_active: true,
  position: 0,
  configuration: {},
};

export default function AdminCMS() {
  const { data: sections, loading, error, refresh } = useAdminCollection<HomeSectionRecord>("home-sections");
  const { data: allProducts } = useAdminCollection<ProductRecord>("products");
  const { data: allCategories } = useAdminCollection<CategoryRecord>("categories");
  const { data: allCollections } = useAdminCollection<CollectionRecord>("collections");

  const [form, setForm] = useState<Partial<HomeSectionRecord>>(emptySection);
  const [editingId, setUpdatingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  const [uploading, setUploading] = useState(false);

  const sortedSections = useMemo(() => {
    return [...sections].sort((a, b) => a.position - b.position);
  }, [sections]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setActionError("");
    try {
      let savedSection: HomeSectionRecord;
      if (editingId) {
        savedSection = await updateAdmin("home-sections", editingId, form);
      } else {
        savedSection = await createAdmin("home-sections", form);
      }

      // Update related items if necessary
      if (form.section_type === "featured_products") {
          await api.post(`/admin/home-sections/${savedSection.id}/items/`, {
              type: "product",
              ids: (form.products || []).map(p => p.id)
          });
      } else if (form.section_type === "categories") {
          await api.post(`/admin/home-sections/${savedSection.id}/items/`, {
              type: "category",
              ids: (form.categories || []).map(c => c.id)
          });
      }

      await refresh();
      closeModal();
    } catch (err) {
      setActionError(readableApiError(err, "Failed to save section"));
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this section?")) return;
    try {
      await deleteAdmin("home-sections", id);
      await refresh();
    } catch (err) {
      setActionError("Failed to delete section");
    }
  }

  async function toggleStatus(section: HomeSectionRecord) {
    try {
      await updateAdmin("home-sections", section.id, { is_active: !section.is_active });
      await refresh();
    } catch (err) {
      setActionError("Failed to update status");
    }
  }

  async function moveSection(id: string, direction: "up" | "down") {
    const idx = sortedSections.findIndex((s) => s.id === id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === sortedSections.length - 1) return;

    const newOrder = [...sortedSections];
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    [newOrder[idx], newOrder[targetIdx]] = [newOrder[targetIdx], newOrder[idx]];

    try {
      await api.post("/admin/home-sections/reorder/", { order: newOrder.map((s) => s.id) });
      await refresh();
    } catch (err) {
      setActionError("Failed to reorder");
    }
  }

  function openModal(section?: HomeSectionRecord) {
    if (section) {
      setForm(section);
      setUpdatingId(section.id);
    } else {
      setForm({ ...emptySection, position: sections.length });
      setUpdatingId(null);
    }
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setForm(emptySection);
    setUpdatingId(null);
  }

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editingId) return;

    setUploading(true);
    const optimizedFile = await optimizeImage(file);
    const formData = new FormData();
    formData.append("image", optimizedFile);

    try {
        const res: any = await api.post("/admin/media/", formData);
        await updateAdmin("home-sections", editingId, { media: res.id });
        await refresh();
        setForm(prev => ({ ...prev, media: res.id, media_url: res.url }));
    } catch (err) {
        setActionError("Failed to upload image");
    } finally {
        setUploading(false);
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length || !editingId) return;

    setUploading(true);
    try {
        const results = await Promise.all(files.map(async (file) => {
            const optimizedFile = await optimizeImage(file);
            const formData = new FormData();
            formData.append("image", optimizedFile);
            return api.post("/admin/media/", formData);
        }));

        const newMediaIds = results.map((res: any) => res.id);
        const currentIds = (form.gallery || []).map(g => g.id);

        await api.post(`/admin/home-sections/${editingId}/items/`, {
            type: "media",
            ids: [...currentIds, ...newMediaIds]
        });

        await refresh();
        // The refresh will update the form if we reopen or if we use the data from sections
        // But for immediate feedback, we can update local state if we want.
        // For now, refresh is safer.
    } catch (err) {
        setActionError("Failed to upload gallery images");
    } finally {
        setUploading(false);
    }
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-midnight tracking-tight">Home Page CMS</h1>
          <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/40 mt-1">Manage website and app content</p>
        </div>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center justify-center bg-midnight px-8 py-3 rounded-full font-sans text-[10px] tracking-[0.2em] uppercase text-ivory hover:bg-midnight-deep transition-all shadow-lg shadow-midnight/10"
        >
          Add new section
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-line p-6 shadow-sm space-y-6">
        {(error || actionError) && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-[11px] text-rose-600 font-sans uppercase tracking-widest flex items-center justify-between">
            <span>{error || actionError}</span>
            <button onClick={() => setActionError("")}>✕</button>
          </div>
        )}

        <div className="space-y-4">
          {sortedSections.map((section, index) => (
            <div key={section.id} className="group flex items-center gap-6 p-4 rounded-3xl border border-line/50 hover:bg-ivory-warm/10 transition-all">
              <div className="flex flex-col gap-1">
                <button onClick={() => moveSection(section.id, "up")} className="p-1 text-midnight/20 hover:text-gold disabled:opacity-10" disabled={index === 0}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                </button>
                <button onClick={() => moveSection(section.id, "down")} className="p-1 text-midnight/20 hover:text-gold disabled:opacity-10" disabled={index === sortedSections.length - 1}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>

              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-ivory-warm border border-line/50 flex items-center justify-center">
                {section.media_url ? (
                  <img src={section.media_url} className="h-full w-full object-cover" alt="" />
                ) : (
                  <span className="text-[10px] uppercase tracking-tighter text-midnight/20">{section.section_type}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-ivory-warm text-[8px] font-bold uppercase tracking-widest text-midnight/40">
                    {SECTION_TYPES[section.section_type]}
                  </span>
                  <span className={`h-1.5 w-1.5 rounded-full ${section.is_active ? "bg-green-500" : "bg-gray-300"}`} />
                </div>
                <h3 className="mt-1 font-display text-lg text-midnight truncate">{section.title || "Untitled Section"}</h3>
                <p className="font-sans text-[10px] text-midnight/40 truncate">{section.subtitle || section.description || "No description"}</p>
              </div>

              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => toggleStatus(section)} className="text-[10px] font-sans uppercase tracking-widest text-midnight/40 hover:text-midnight">
                  {section.is_active ? "Disable" : "Enable"}
                </button>
                <button onClick={() => openModal(section)} className="p-2 text-midnight/40 hover:text-midnight">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button onClick={() => handleDelete(section.id)} className="p-2 text-midnight/20 hover:text-rose-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))}

          {loading && (
            <div className="py-20 text-center text-midnight/20 font-voice italic">Loading content...</div>
          )}

          {!loading && sections.length === 0 && (
            <div className="py-20 text-center text-midnight/30 font-voice italic">No home sections configured yet.</div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight/60 backdrop-blur-sm">
          <div className="bg-ivory w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[40px] shadow-2xl border border-line p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-display text-2xl text-midnight">{editingId ? "Edit Section" : "New Section"}</h2>
              <button onClick={closeModal} className="text-midnight/40 hover:text-midnight">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/60 mb-2">Section Type</label>
                  <select
                    value={form.section_type}
                    onChange={(e) => setForm({ ...form, section_type: e.target.value as HomeSectionType })}
                    className="w-full bg-white border border-line rounded-2xl px-5 py-3 text-xs outline-none focus:ring-1 focus:ring-gold/30"
                  >
                    {Object.entries(SECTION_TYPES).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/60 mb-2">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-white border border-line rounded-2xl px-5 py-3 text-xs outline-none focus:ring-1 focus:ring-gold/30"
                  />
                </div>

                <div>
                  <label className="block font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/60 mb-2">Subtitle</label>
                  <input
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    className="w-full bg-white border border-line rounded-2xl px-5 py-3 text-xs outline-none focus:ring-1 focus:ring-gold/30"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/60 mb-2">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    className="w-full bg-white border border-line rounded-2xl px-5 py-3 text-xs outline-none focus:ring-1 focus:ring-gold/30"
                  />
                </div>

                <div>
                  <label className="block font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/60 mb-2">Button Text</label>
                  <input
                    value={form.button_text}
                    onChange={(e) => setForm({ ...form, button_text: e.target.value })}
                    className="w-full bg-white border border-line rounded-2xl px-5 py-3 text-xs outline-none focus:ring-1 focus:ring-gold/30"
                  />
                </div>

                <div>
                  <label className="block font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/60 mb-2">Link</label>
                  <input
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    className="w-full bg-white border border-line rounded-2xl px-5 py-3 text-xs outline-none focus:ring-1 focus:ring-gold/30"
                  />
                </div>

                {(form.section_type === "featured_products") && (
                  <div className="md:col-span-2">
                    <label className="block font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/60 mb-2">Select Products</label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-4 bg-white border border-line rounded-2xl">
                      {allProducts.map(p => (
                        <label key={p.id} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={form.products?.some(sp => sp.id === p.id)}
                            onChange={(e) => {
                                const current = form.products || [];
                                const next = e.target.checked ? [...current, p] : current.filter(x => x.id !== p.id);
                                setForm({ ...form, products: next });
                            }}
                          />
                          {p.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {(form.section_type === "categories") && (
                  <div className="md:col-span-2">
                    <label className="block font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/60 mb-2">Select Categories</label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-4 bg-white border border-line rounded-2xl">
                      {allCategories.map(c => (
                        <label key={c.id} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={form.categories?.some(sc => sc.id === c.id)}
                            onChange={(e) => {
                                const current = form.categories || [];
                                const next = e.target.checked ? [...current, c] : current.filter(x => x.id !== c.id);
                                setForm({ ...form, categories: next });
                            }}
                          />
                          {c.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {(form.section_type === "featured_collection") && (
                  <div className="md:col-span-2">
                    <label className="block font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/60 mb-2">Select Collection</label>
                    <select
                      value={form.collection || ""}
                      onChange={(e) => setForm({ ...form, collection: e.target.value })}
                      className="w-full bg-white border border-line rounded-2xl px-5 py-3 text-xs outline-none focus:ring-1 focus:ring-gold/30"
                    >
                      <option value="">Select a collection...</option>
                      {allCollections.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {(form.section_type === "lookbook" || form.section_type === "custom") && (
                  <div className="md:col-span-2">
                    <label className="block font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/60 mb-2">Gallery Images</label>
                    <div className="flex flex-wrap gap-4 p-4 bg-white border border-line rounded-2xl">
                      {form.gallery?.map((img) => (
                        <div key={img.id} className="relative h-20 w-20 rounded-lg overflow-hidden border border-line">
                          <img src={img.url} className="h-full w-full object-cover" alt="" />
                          <button
                            type="button"
                            onClick={async () => {
                                if (!editingId) return;
                                const nextIds = form.gallery?.filter(x => x.id !== img.id).map(g => g.id) || [];
                                await api.post(`/admin/home-sections/${editingId}/items/`, {
                                    type: "media",
                                    ids: nextIds
                                });
                                await refresh();
                            }}
                            className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-0.5"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                      <label className="h-20 w-20 flex items-center justify-center border-2 border-dashed border-line rounded-lg cursor-pointer hover:border-gold/50 text-midnight/20">
                        <input type="file" multiple hidden onChange={handleGalleryUpload} disabled={!editingId} />
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      </label>
                    </div>
                    {!editingId && <p className="mt-2 text-[10px] text-amber-600">Save the section first to enable gallery uploads.</p>}
                  </div>
                )}
              </div>

              {editingId && (
                <div className="p-6 bg-ivory-warm/30 rounded-3xl border border-line/50">
                  <label className="block font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/60 mb-4">Main Image</label>
                  <div className="flex items-center gap-6">
                    <div className="h-32 w-48 overflow-hidden rounded-2xl bg-white border border-line flex items-center justify-center">
                      {form.media_url ? (
                        <img src={form.media_url} className="h-full w-full object-cover" alt="" />
                      ) : (
                        <span className="text-[10px] text-midnight/20 italic">No image</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <input type="file" id="media-upload" hidden onChange={handleMediaUpload} />
                      <label htmlFor="media-upload" className="inline-flex cursor-pointer bg-midnight text-ivory px-6 py-2 rounded-full text-[10px] uppercase tracking-widest hover:bg-midnight-deep transition-all">
                        {uploading ? "Uploading..." : "Upload New Image"}
                      </label>
                      <p className="text-[9px] text-midnight/40 leading-relaxed">Recommended size: 2000x1200 for Hero, 1000x1250 for Editorial.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={closeModal} className="px-8 py-3 rounded-full font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/60 hover:text-midnight">Cancel</button>
                <button type="submit" className="bg-midnight text-ivory px-10 py-3 rounded-full font-sans text-[10px] tracking-[0.2em] uppercase hover:bg-midnight-deep transition-all">Save Section</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
