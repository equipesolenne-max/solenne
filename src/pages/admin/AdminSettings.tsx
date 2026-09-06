import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "../../api/admin";
import type { StoreSettings } from "../../types/admin";
import { defaultSettings } from "../../data/adminMockData";
import { seedCatalog } from "../../services/seedCatalog";

export default function AdminSettings() {
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [seeding, setSeeding] = useState(false);

  useEffect(() => { void getSettings().then((value) => { if (value && Object.keys(value).length > 0) setSettings(value); }).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load settings.")).finally(() => setLoading(false)); }, []);

  function updateField<T extends keyof StoreSettings>(key: T, value: StoreSettings[T]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    setSaving(true); setMessage(""); setError("");
    try { await updateSettings(settings); setMessage("Settings saved."); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save settings."); }
    finally { setSaving(false); }
  }

  async function handleSeed() {
    setSeeding(true); setMessage(""); setError("");
    try { await seedCatalog(); setMessage("Initial catalog data has been saved to the database."); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to seed the catalog."); }
    finally { setSeeding(false); }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="font-sans text-[10px] tracking-[0.22em] uppercase text-[#C6A369]">Settings</div>
        <h1 className="mt-2 font-display text-3xl text-[#1B2A46]">Store settings</h1>
      </div>

      <div className="rounded-[28px] border border-[#1B2A46]/10 bg-[#F8F4EC] p-5">
        {loading && <div className="mb-4 text-sm text-[#1B2A46]/60">Loading settings...</div>}
        {message && <div role="status" className="mb-4 text-sm text-green-800">{message}</div>}
        {error && <div role="alert" className="mb-4 text-sm text-red-900">{error}</div>}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">Store name</label>
            <input value={settings.storeName} onChange={(event) => updateField("storeName", event.target.value)} className="w-full border border-[#1B2A46]/15 bg-[#F3EDE1] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]" />
          </div>
          <div>
            <label className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">Store tagline</label>
            <input value={settings.storeTagline} onChange={(event) => updateField("storeTagline", event.target.value)} className="w-full border border-[#1B2A46]/15 bg-[#F3EDE1] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]" />
          </div>
          <div>
            <label className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">Contact email</label>
            <input value={settings.contactEmail} onChange={(event) => updateField("contactEmail", event.target.value)} className="w-full border border-[#1B2A46]/15 bg-[#F3EDE1] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]" />
          </div>
          <div>
            <label className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">Phone</label>
            <input value={settings.phone} onChange={(event) => updateField("phone", event.target.value)} className="w-full border border-[#1B2A46]/15 bg-[#F3EDE1] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]" />
          </div>
          <div>
            <label className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">Currency</label>
            <input value={settings.currency} onChange={(event) => updateField("currency", event.target.value)} className="w-full border border-[#1B2A46]/15 bg-[#F3EDE1] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]" />
          </div>
          <div>
            <label className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">Shipping price</label>
            <input type="number" value={settings.shippingPrice} onChange={(event) => updateField("shippingPrice", Number(event.target.value))} className="w-full border border-[#1B2A46]/15 bg-[#F3EDE1] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]" />
          </div>
          <div>
            <label className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">Low-stock threshold</label>
            <input type="number" value={settings.lowStockThreshold} onChange={(event) => updateField("lowStockThreshold", Number(event.target.value))} className="w-full border border-[#1B2A46]/15 bg-[#F3EDE1] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]" />
          </div>
          <div>
            <label className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">Store status</label>
            <select value={settings.storeStatus} onChange={(event) => updateField("storeStatus", event.target.value as StoreSettings["storeStatus"])} className="w-full border border-[#1B2A46]/15 bg-[#F3EDE1] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]">
              <option value="open">Open</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        <div className="mt-5 border-t border-[#1B2A46]/10 pt-5">
          <h2 className="font-display text-2xl text-[#1B2A46]">Social links</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-3">
            <div>
              <label className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">Instagram</label>
              <input value={settings.socialLinks.instagram} onChange={(event) => updateField("socialLinks", { ...settings.socialLinks, instagram: event.target.value })} className="w-full border border-[#1B2A46]/15 bg-[#F3EDE1] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]" />
            </div>
            <div>
              <label className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">TikTok</label>
              <input value={settings.socialLinks.tiktok} onChange={(event) => updateField("socialLinks", { ...settings.socialLinks, tiktok: event.target.value })} className="w-full border border-[#1B2A46]/15 bg-[#F3EDE1] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]" />
            </div>
            <div>
              <label className="mb-2 block font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46]/70">Pinterest</label>
              <input value={settings.socialLinks.pinterest} onChange={(event) => updateField("socialLinks", { ...settings.socialLinks, pinterest: event.target.value })} className="w-full border border-[#1B2A46]/15 bg-[#F3EDE1] px-4 py-3 text-[#1B2A46] outline-none focus:border-[#C6A369]" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <div className="flex flex-wrap justify-end gap-3"><button onClick={() => void handleSeed()} disabled={seeding || loading} className="border border-[#1B2A46]/20 px-5 py-3 font-sans text-[11px] tracking-[0.18em] uppercase text-[#1B2A46] disabled:opacity-60">{seeding ? "Seeding..." : "Initialize catalog"}</button><button onClick={() => void handleSave()} disabled={saving || loading} className="border border-[#1B2A46] bg-[#1B2A46] px-5 py-3 font-sans text-[11px] tracking-[0.18em] uppercase text-[#F8F4EC] hover:bg-[#101B30] disabled:opacity-60">{saving ? "Saving..." : "Save settings"}</button></div>
        </div>
      </div>
    </div>
  );
}
