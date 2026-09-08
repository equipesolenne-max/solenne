import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartProvider";
import { useUserAuth } from "../contexts/UserAuthProvider";
import { fetchCustomerAddresses } from "../services/addresses";
import { fetchUserProfile } from "../services/userProfile";
import { api } from "../api/client";
import { formatDZD } from "../utils/currency";
import { getWilayas, getCommunes } from "../services/locationData";

export default function Checkout() {
  const { items, clear } = useCart();
  const { user } = useUserAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.displayName ?? "",
    phone: "",
    wilaya: "",
    commune: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [addressLoaded, setAddressLoaded] = useState(false);

  // Simple idempotency key for duplicate prevention
  const [idempotencyKey] = useState(() => `${user?.uid || "guest"}-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [items]);
  const shipping = subtotal >= 5000 ? 0 : 1000;

  const wilayas = useMemo(() => getWilayas(), []);
  const communes = useMemo(() => getCommunes(form.wilaya), [form.wilaya]);

  // Auto-prefill default shipping address
  useEffect(() => {
    if (!user) return;
    let active = true;

    void (async () => {
      try {
        const [addresses, profile] = await Promise.all([
          fetchCustomerAddresses(user.uid),
          fetchUserProfile(user.uid),
        ]);

        if (!active) return;
        const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];

        setForm((prev) => ({
          name: defaultAddr?.fullName || profile?.name || user.displayName || prev.name,
          phone: defaultAddr?.phone || profile?.phone || prev.phone,
          wilaya: defaultAddr?.wilaya || prev.wilaya,
          commune: defaultAddr?.commune || prev.commune,
          address: defaultAddr?.address || prev.address,
        }));
        setAddressLoaded(true);
      } catch (err) {
        console.error("Failed to load user address for checkout:", err);
      }
    })();

    return () => {
      active = false;
    };
  }, [user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      setError("Please sign in before placing an order.");
      return;
    }
    if (!items.length) {
      setError("Your bag is empty.");
      return;
    }

    if (!form.wilaya || !form.commune) {
      setError("Please select your Wilaya and Commune.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const result = await api.post<{ id: string }>("/orders/", {
        items: items.map(item => ({
          productId: item.product.id,
          variantId: item.variantId,
          quantity: item.quantity,
          color: item.color,
          size: item.size
        })),
        shippingAddress: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          wilaya: form.wilaya,
          commune: form.commune,
          address: form.address.trim(),
        },
        paymentMethod: "Cash on delivery",
        idempotencyKey
      });

      const { id } = result;
      clear();
      navigate(`/order-confirmation?id=${id}`, { replace: true });
    } catch (reason: any) {
      console.error("Order creation error:", reason);
      setError(reason?.message || "Unable to place your order. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-page px-6 py-20 text-center">
        <h1 className="font-display text-3xl">Your bag is empty</h1>
        <Link to="/shop" className="mt-8 inline-block bg-midnight px-6 py-4 text-xs uppercase tracking-[0.2em] text-ivory">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-page px-6 py-16 md:px-10">
      <div className="mx-auto max-w-2xl">
        <span className="eyebrow">Almost there</span>
        <h1 className="mt-4 font-display text-3xl">Checkout</h1>

        {addressLoaded && (form.wilaya || form.address) && (
          <div className="mt-4 p-3 bg-ivory-warm/60 border border-line text-xs font-sans text-midnight/70 flex items-center justify-between">
            <span>✓ Pre-filled using your saved default address.</span>
            <Link to="/account?tab=addresses" className="underline text-gold">Manage</Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <p role="alert" className="border border-red-900/20 bg-red-50 p-4 text-sm text-red-900 font-sans">
              {error}
            </p>
          )}

          <label className="block text-sm font-sans">
            Full name
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
              className="mt-2 w-full border border-line bg-transparent px-4 py-3 outline-none focus:border-gold font-sans"
            />
          </label>

          <label className="block text-sm font-sans">
            Phone
            <input
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              required
              type="tel"
              className="mt-2 w-full border border-line bg-transparent px-4 py-3 outline-none focus:border-gold font-sans"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-sans">
              Wilaya
              <select
                value={form.wilaya}
                onChange={(event) => setForm({ ...form, wilaya: event.target.value, commune: "" })}
                required
                className="mt-2 w-full border border-line bg-transparent px-4 py-3 outline-none focus:border-gold font-sans appearance-none"
              >
                <option value="">Select Wilaya</option>
                {wilayas.map((w) => (
                  <option key={w.id} value={w.name}>
                    {w.id} — {w.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-sans">
              Commune
              <select
                value={form.commune}
                onChange={(event) => setForm({ ...form, commune: event.target.value })}
                required
                disabled={!form.wilaya}
                className="mt-2 w-full border border-line bg-transparent px-4 py-3 outline-none focus:border-gold font-sans appearance-none disabled:opacity-50"
              >
                <option value="">Select Commune</option>
                {communes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm font-sans">
            Address
            <textarea
              value={form.address}
              onChange={(event) => setForm({ ...form, address: event.target.value })}
              required
              rows={3}
              className="mt-2 w-full border border-line bg-transparent px-4 py-3 outline-none focus:border-gold font-sans"
            />
          </label>

          <div className="border-t border-line pt-5">
            <div className="flex justify-between text-sm font-sans">
              <span>Subtotal</span>
              <span>{formatDZD(subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm font-sans">
              <span>Shipping</span>
              <span>{shipping ? formatDZD(shipping) : "Free"}</span>
            </div>
            <div className="mt-4 flex justify-between font-display text-lg">
              <span>Total</span>
              <span>{formatDZD(subtotal + shipping)}</span>
            </div>
          </div>

          <button
            disabled={busy}
            className="w-full bg-midnight px-6 py-4 text-xs uppercase tracking-[0.2em] text-ivory hover:bg-midnight-deep transition-colors disabled:opacity-60 font-sans"
          >
            {busy ? "Placing order..." : "Place order"}
          </button>
        </form>
      </div>
    </div>
  );
}
