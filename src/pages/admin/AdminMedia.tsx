import { useState } from "react";
import { useAdminCollection } from "../../hooks/useAdminCollection";
import { uploadMedia, deleteAdmin } from "../../api/admin";
import { readableApiError } from "../../services/errorMessage";
import { optimizeImage } from "../../utils/image";

interface MediaRecord {
  id: string;
  name: string;
  url: string;
  content_type: string;
  created_at: string;
}

export default function AdminMedia() {
  const { data: media, loading, error, refresh } = useAdminCollection<MediaRecord>("media");
  const [uploading, setUploading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [search, setSearch] = useState("");

  const filteredMedia = media.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setActionError("");
    try {
      await Promise.all(files.map(async (file) => {
        const optimized = await optimizeImage(file);
        return uploadMedia(optimized as File);
      }));
      await refresh();
    } catch (err) {
      setActionError(readableApiError(err, "Failed to upload images"));
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure? This action cannot be undone and may break sections using this image.")) return;
    try {
      await deleteAdmin("media", id);
      await refresh();
    } catch (err) {
      setActionError("Failed to delete media");
    }
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-midnight tracking-tight">Media Library</h1>
          <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-midnight/40 mt-1">Manage and reuse your assets</p>
        </div>
        <div className="flex gap-3">
          <label className="inline-flex items-center justify-center bg-midnight px-8 py-3 rounded-full font-sans text-[10px] tracking-[0.2em] uppercase text-ivory hover:bg-midnight-deep transition-all shadow-lg shadow-midnight/10 cursor-pointer">
            <input type="file" multiple hidden onChange={handleUpload} disabled={uploading} />
            {uploading ? "Uploading..." : "Upload Media"}
          </label>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-line p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by filename..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-ivory-warm/20 border-line rounded-2xl px-5 py-2 text-xs outline-none focus:ring-1 focus:ring-gold/30"
            />
          </div>
          <div className="text-[10px] text-midnight/40 uppercase tracking-widest font-sans">
            {filteredMedia.length} assets
          </div>
        </div>

        {(error || actionError) && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-[11px] text-rose-600 font-sans uppercase tracking-widest flex items-center justify-between">
            <span>{error || actionError}</span>
            <button onClick={() => setActionError("")}>✕</button>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-midnight/20 font-voice italic">Loading library...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {filteredMedia.map((item) => (
              <div key={item.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-line bg-ivory-warm/20">
                <img src={item.url} className="h-full w-full object-cover transition-transform group-hover:scale-105" alt={item.name} />
                <div className="absolute inset-0 bg-midnight/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  <p className="text-[8px] text-ivory/80 text-center break-all line-clamp-2 px-2 uppercase tracking-tighter">{item.name}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.url);
                        alert("URL copied to clipboard");
                      }}
                      className="p-1.5 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                      title="Copy URL"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 bg-rose-500/80 hover:bg-rose-500 rounded-full text-white transition-colors"
                      title="Delete"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!filteredMedia.length && (
              <div className="col-span-full py-20 text-center text-midnight/30 font-voice italic">No media found matching your search.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
