import { useState, useEffect } from "react";
import { useUserAuth } from "../../contexts/UserAuthProvider";
import {
  fetchCustomerAddresses,
  addCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
} from "../../services/addresses";
import type { CustomerAddress } from "../../types/user";

export default function AddressesManager() {
  const { user } = useUserAuth();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Form State
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    wilaya: "",
    commune: "",
    postalCode: "",
    isDefault: false,
  });

  const refreshAddresses = async () => {
    if (!user) return;
    try {
      const data = await fetchCustomerAddresses(user.uid);
      setAddresses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load addresses.");
    }
  };

  useEffect(() => {
    if (!user) return;
    let active = true;
    void fetchCustomerAddresses(user.uid)
      .then((data) => {
        if (active) setAddresses(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Unable to load addresses.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const openAddModal = () => {
    setForm({
      fullName: user?.displayName ?? "",
      phone: "",
      address: "",
      wilaya: "",
      commune: "",
      postalCode: "",
      isDefault: addresses.length === 0,
    });
    setEditingAddress(null);
    setIsAdding(true);
    setError("");
  };

  const openEditModal = (addr: CustomerAddress) => {
    setForm({
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      wilaya: addr.wilaya,
      commune: addr.commune,
      postalCode: addr.postalCode ?? "",
      isDefault: addr.isDefault,
    });
    setEditingAddress(addr);
    setIsAdding(false);
    setError("");
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingAddress(null);
    setError("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setError("");

    try {
      if (isAdding) {
        await addCustomerAddress(user.uid, form);
      } else if (editingAddress) {
        await updateCustomerAddress(user.uid, editingAddress.id, form);
      }
      closeModal();
      await refreshAddresses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save address.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Are you sure you want to delete this address?")) return;
    try {
      await deleteCustomerAddress(user.uid, id);
      await refreshAddresses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete address.");
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    try {
      await setDefaultCustomerAddress(user.uid, id);
      await refreshAddresses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update default address.");
    }
  };

  if (loading) {
    return (
      <div className="py-8 space-y-6 animate-pulse">
        <div className="h-4 bg-line/50 rounded w-1/4" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-40 bg-ivory-warm rounded" />
          <div className="h-40 bg-ivory-warm rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="eyebrow">Shipping</span>
          <h2 className="font-display text-2xl text-midnight mt-1">Saved Addresses</h2>
          <p className="font-voice italic text-sm text-midnight/60 mt-1">
            Manage your delivery destinations for quick checkout.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-midnight text-ivory font-sans text-[11px] tracking-[0.2em] uppercase px-6 py-3.5 hover:bg-midnight-deep transition-colors"
        >
          + Add New Address
        </button>
      </div>

      {error && (
        <div role="alert" className="p-4 border border-red-900/20 bg-red-50 text-sm text-red-900 font-sans">
          {error}
        </div>
      )}

      {/* Address List */}
      {addresses.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-line bg-ivory-warm/30 p-8">
          <svg className="w-10 h-10 mx-auto text-midnight/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <h3 className="font-display text-lg text-midnight">No saved addresses</h3>
          <p className="font-voice italic text-sm text-midnight/60 mt-2 max-w-sm mx-auto">
            Add an address to make your next checkout faster and seamless.
          </p>
          <button
            onClick={openAddModal}
            className="mt-6 inline-block bg-midnight text-ivory font-sans text-[11px] tracking-[0.2em] uppercase px-7 py-3.5 hover:bg-midnight-deep transition-colors"
          >
            Add Address
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`relative border p-6 flex flex-col justify-between transition-all ${
                addr.isDefault
                  ? "border-gold bg-ivory-warm/50 ring-1 ring-gold/30"
                  : "border-line bg-ivory/60 hover:border-midnight/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-display text-base text-midnight">{addr.fullName}</h3>
                  {addr.isDefault && (
                    <span className="font-sans text-[9px] tracking-[0.2em] uppercase bg-gold text-midnight px-2.5 py-1 font-semibold">
                      Default
                    </span>
                  )}
                </div>
                <p className="font-sans text-sm text-midnight/80 leading-relaxed">{addr.address}</p>
                <p className="font-sans text-sm text-midnight/80">
                  {addr.commune}, {addr.wilaya} {addr.postalCode && `(${addr.postalCode})`}
                </p>
                <p className="font-sans text-xs text-midnight/60 mt-3">Phone: {addr.phone}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between gap-2 font-sans text-[11px] tracking-[0.14em] uppercase">
                <div className="flex gap-4">
                  <button onClick={() => openEditModal(addr)} className="text-midnight hover:text-gold transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="text-red-900/70 hover:text-red-900 transition-colors">
                    Delete
                  </button>
                </div>
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr.id)} className="text-gold hover:underline">
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal / Form Drawer */}
      {(isAdding || editingAddress) && (
        <div className="fixed inset-0 z-50 bg-midnight/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ivory border border-line w-full max-w-lg p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b border-line pb-4">
              <h3 className="font-display text-xl text-midnight">
                {isAdding ? "Add New Shipping Address" : "Edit Shipping Address"}
              </h3>
              <button onClick={closeModal} className="text-midnight/60 hover:text-midnight text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block font-sans text-[11px] tracking-[0.15em] uppercase text-midnight/70 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full bg-transparent border border-line px-4 py-3 font-sans text-sm text-midnight outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block font-sans text-[11px] tracking-[0.15em] uppercase text-midnight/70 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-transparent border border-line px-4 py-3 font-sans text-sm text-midnight outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-[11px] tracking-[0.15em] uppercase text-midnight/70 mb-1.5">
                    Wilaya
                  </label>
                  <input
                    type="text"
                    required
                    value={form.wilaya}
                    onChange={(e) => setForm({ ...form, wilaya: e.target.value })}
                    className="w-full bg-transparent border border-line px-4 py-3 font-sans text-sm text-midnight outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block font-sans text-[11px] tracking-[0.15em] uppercase text-midnight/70 mb-1.5">
                    Commune
                  </label>
                  <input
                    type="text"
                    required
                    value={form.commune}
                    onChange={(e) => setForm({ ...form, commune: e.target.value })}
                    className="w-full bg-transparent border border-line px-4 py-3 font-sans text-sm text-midnight outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-[11px] tracking-[0.15em] uppercase text-midnight/70 mb-1.5">
                  Street Address
                </label>
                <textarea
                  required
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-transparent border border-line px-4 py-3 font-sans text-sm text-midnight outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block font-sans text-[11px] tracking-[0.15em] uppercase text-midnight/70 mb-1.5">
                  Postal Code (Optional)
                </label>
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  className="w-full bg-transparent border border-line px-4 py-3 font-sans text-sm text-midnight outline-none focus:border-gold"
                />
              </div>

              <label className="flex items-center gap-3 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                  className="w-4 h-4 accent-midnight"
                />
                <span className="font-sans text-xs text-midnight">Set as default shipping address</span>
              </label>

              <div className="pt-4 flex justify-end gap-3 border-t border-line">
                <button
                  type="button"
                  onClick={closeModal}
                  className="border border-line px-6 py-3 font-sans text-[11px] tracking-[0.15em] uppercase text-midnight hover:bg-ivory-warm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="bg-midnight text-ivory px-6 py-3 font-sans text-[11px] tracking-[0.15em] uppercase hover:bg-midnight-deep disabled:opacity-60"
                >
                  {busy ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
