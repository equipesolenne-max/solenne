import { Link } from "react-router-dom";
import { formatDZD } from "../utils/currency";
import { useCart } from "../contexts/CartProvider";

export default function Cart() {
  const { items, updateQuantity, removeItem } = useCart();

  const subtotal = items.reduce((sum, item) => {
    const variant = item.product.variants.find(v => v.id === item.variantId);
    const price = variant?.price || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <div className="max-w-page mx-auto px-6 md:px-10 py-16">
      <div className="text-center mb-14">
        <span className="eyebrow">Votre Sélection</span>
        <h1 className="font-display text-3xl md:text-4xl text-midnight mt-4">Panier d'achat</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-voice italic text-lg text-midnight/60 mb-8">Votre panier est actuellement vide.</p>
          <Link
            to="/shop"
            className="inline-block font-sans text-[12px] tracking-[0.2em] uppercase bg-midnight text-ivory px-10 py-4 hover:bg-midnight-deep transition-all"
          >
            Continuer mes achats
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-[1fr_380px] gap-14 items-start">
          <div className="divide-y divide-line border-t border-b border-line">
            {items.map((item) => {
              const variant = item.product.variants.find(v => v.id === item.variantId);
              const price = variant?.price || item.product.price;
              const image = variant?.image || item.product.images[0];
              const key = `${item.product.id}-${item.variantId || 'base'}`;

              return (
                <div key={key} className="flex gap-6 py-10">
                  <Link to={`/product/${item.product.id}`} className="shrink-0">
                    <img
                      src={image}
                      alt={item.product.name}
                      className="w-32 aspect-[4/5] object-cover bg-ivory-warm"
                    />
                  </Link>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <Link to={`/product/${item.product.id}`} className="hover:text-gold transition-colors">
                          <h3 className="font-display text-lg text-midnight tracking-tight">{item.product.name}</h3>
                        </Link>
                        <p className="font-voice italic text-[15px] text-midnight/50 mt-1">
                          {item.color}{item.size ? ` — ${item.size}` : ""}
                        </p>
                      </div>
                      <p className="font-sans text-sm text-midnight">
                        {formatDZD(price)}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-line bg-white/50">
                        <button
                          aria-label="Diminuer la quantité"
                          onClick={() => updateQuantity(item.product.id, item.variantId, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center font-sans text-midnight/40 hover:text-midnight transition-colors"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-sans text-xs">{item.quantity}</span>
                        <button
                          aria-label="Augmenter la quantité"
                          onClick={() => updateQuantity(item.product.id, item.variantId, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center font-sans text-midnight/40 hover:text-midnight transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.variantId)}
                        className="font-sans text-[10px] tracking-widest uppercase text-midnight/40 hover:text-red-400 transition-colors"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-ivory-warm/40 border border-line p-10 sticky top-24">
            <h2 className="font-display text-xl text-midnight mb-8 tracking-tight">Résumé de la commande</h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between font-sans text-[11px] tracking-widest uppercase text-midnight/60">
                <span>Sous-total</span>
                <span>{formatDZD(subtotal)}</span>
              </div>
              <div className="flex justify-between font-sans text-[11px] tracking-widest uppercase text-midnight/60">
                <span>Livraison</span>
                <span className="text-gold">{subtotal >= 5000 ? "Gratuite" : "Calculée à l'étape suivante"}</span>
              </div>
            </div>

            <div className="flex justify-between font-display text-lg text-midnight border-t border-line pt-6 mb-10">
              <span>Total</span>
              <span>{formatDZD(subtotal)}</span>
            </div>

            <Link
              to="/checkout"
              className="block w-full text-center font-sans text-[12px] tracking-[0.25em] uppercase bg-midnight text-ivory py-5 hover:bg-midnight-deep shadow-lg hover:shadow-midnight/10 transition-all"
            >
              Passer à la caisse
            </Link>

            <div className="mt-8 pt-8 border-t border-line/40 text-center">
              <p className="font-voice italic text-sm text-midnight/50">
                Livraison sécurisée sous 2 à 5 jours ouvrables.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
