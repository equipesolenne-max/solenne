import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartProvider";
import { useUserAuth } from "../contexts/UserAuthProvider";
import { fetchCustomerAddresses } from "../services/addresses";
import { fetchUserProfile } from "../services/userProfile";
import { api } from "../api/client";
import { formatDZD } from "../utils/currency";
import { getWilayas, getCommunes } from "../services/locationData";
import type { DeliveryMethod, ShippingRate } from "../types/shipping";

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
    deliveryMethod: "home_delivery" as DeliveryMethod,
  });
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [addressLoaded, setAddressLoaded] = useState(false);

  // Simple idempotency key for duplicate prevention
  const [idempotencyKey] = useState(() => `${user?.uid || "guest"}-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const subtotal = useMemo(() => items.reduce((sum, item) => {
    const variant = item.product.variants.find(v => v.id === item.variantId);
    return sum + (variant?.price || item.product.price) * item.quantity;
  }, 0), [items]);

  useEffect(() => {
    api.get<ShippingRate[]>("/shipping/rates/").then(setShippingRates).catch(console.error);
  }, []);

  const currentRate = useMemo(() => {
    return shippingRates.find(r => r.wilaya_name.toLowerCase() === form.wilaya.toLowerCase());
  }, [shippingRates, form.wilaya]);

  const shipping = useMemo(() => {
    if (subtotal >= 5000) return 0;
    if (!currentRate) return 1000;
    return form.deliveryMethod === "home_delivery" ? currentRate.home_delivery_price : currentRate.stop_desk_price;
  }, [subtotal, currentRate, form.deliveryMethod]);

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

        if (defaultAddr) {
          setForm((prev) => ({
            ...prev,
            name: defaultAddr.fullName || profile?.name || user.displayName || prev.name,
            phone: defaultAddr.phone || profile?.phone || prev.phone,
            wilaya: defaultAddr.wilaya || prev.wilaya,
            commune: defaultAddr.commune || prev.commune,
            address: defaultAddr.address || prev.address,
          }));
          setAddressLoaded(true);
        }
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
      setError("Veuillez vous connecter avant de passer une commande.");
      return;
    }
    if (!items.length) {
      setError("Votre panier est vide.");
      return;
    }

    if (!form.wilaya || !form.commune) {
      setError("Veuillez sélectionner votre Wilaya et Commune.");
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
          deliveryMethod: form.deliveryMethod,
        },
        paymentMethod: "Cash on delivery",
        idempotencyKey
      });

      const { id } = result;
      clear();
      navigate(`/order-confirmation?id=${id}`, { replace: true });
    } catch (reason: any) {
      console.error("Order creation error:", reason);
      setError(reason?.message || "Impossible de passer votre commande. Veuillez réessayer.");
    } finally {
      setBusy(false);
    }
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-page px-6 py-20 text-center">
        <h1 className="font-display text-3xl">Votre panier est vide</h1>
        <Link to="/shop" className="mt-8 inline-block bg-midnight px-6 py-4 text-xs uppercase tracking-[0.2em] text-ivory">
          Continuer mes achats
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-page px-6 py-16 md:px-10">
      <div className="mx-auto max-w-2xl">
        <span className="eyebrow">Dernière étape</span>
        <h1 className="mt-4 font-display text-3xl">Paiement</h1>

        {addressLoaded && (form.wilaya || form.address) && (
          <div className="mt-4 p-3 bg-ivory-warm/60 border border-line text-xs font-sans text-midnight/70 flex items-center justify-between">
            <span>✓ Pré-rempli avec votre adresse par défaut.</span>
            <Link to="/account?tab=addresses" className="underline text-gold">Gérer</Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <p role="alert" className="border border-red-900/20 bg-red-50 p-4 text-sm text-red-900 font-sans">
              {error}
            </p>
          )}

          <div className="space-y-4">
            <h2 className="font-display text-lg border-b border-line pb-2">Informations de contact</h2>
            <label className="block text-sm font-sans">
              Nom complet
              <input
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
                className="mt-2 w-full border border-line bg-transparent px-4 py-3 outline-none focus:border-gold font-sans"
              />
            </label>

            <label className="block text-sm font-sans">
              Téléphone
              <input
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                required
                type="tel"
                className="mt-2 w-full border border-line bg-transparent px-4 py-3 outline-none focus:border-gold font-sans"
              />
            </label>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="font-display text-lg border-b border-line pb-2">Adresse de livraison</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-sans">
                Wilaya
                <select
                  value={form.wilaya}
                  onChange={(event) => setForm({ ...form, wilaya: event.target.value, commune: "" })}
                  required
                  className="mt-2 w-full border border-line bg-transparent px-4 py-3 outline-none focus:border-gold font-sans appearance-none"
                >
                  <option value="">Sélectionner Wilaya</option>
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
                  <option value="">Sélectionner Commune</option>
                  {communes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-sm font-sans">
              Adresse
              <textarea
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                required
                rows={3}
                className="mt-2 w-full border border-line bg-transparent px-4 py-3 outline-none focus:border-gold font-sans"
              />
            </label>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="font-display text-lg border-b border-line pb-2">Mode de livraison</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, deliveryMethod: "home_delivery" })}
                className={`p-4 border text-left flex flex-col gap-1 transition-all ${form.deliveryMethod === "home_delivery" ? "border-gold bg-ivory-warm/40" : "border-line"}`}
              >
                <span className="font-sans font-medium text-sm">Livraison à domicile</span>
                <span className="text-xs text-midnight/60">Remis en main propre</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, deliveryMethod: "stop_desk" })}
                className={`p-4 border text-left flex flex-col gap-1 transition-all ${form.deliveryMethod === "stop_desk" ? "border-gold bg-ivory-warm/40" : "border-line"}`}
              >
                <span className="font-sans font-medium text-sm">Stop Desk</span>
                <span className="text-xs text-midnight/60">Récupération au bureau de poste</span>
              </button>
            </div>
          </div>

          <div className="border-t border-line pt-6">
            <div className="flex justify-between text-sm font-sans">
              <span>Sous-total</span>
              <span>{formatDZD(subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm font-sans">
              <span>Livraison {form.deliveryMethod === "stop_desk" ? "(Stop Desk)" : "(À domicile)"}</span>
              <span>{shipping ? formatDZD(shipping) : "Gratuite"}</span>
            </div>
            <div className="mt-6 flex justify-between font-display text-xl border-t border-line pt-4">
              <span>Total</span>
              <span>{formatDZD(subtotal + shipping)}</span>
            </div>
          </div>

          <button
            disabled={busy}
            className="w-full bg-midnight px-6 py-5 text-sm uppercase tracking-[0.2em] text-ivory hover:bg-midnight-deep transition-all disabled:opacity-60 font-sans shadow-lg"
          >
            {busy ? "Traitement en cours..." : "Confirmer la commande"}
          </button>
        </form>
      </div>
    </div>
  );
}
