import { Link } from "react-router-dom";
import { formatDZD } from "../utils/currency";
import { useCart } from "../contexts/CartProvider";

export default function Cart() {
  const { items, updateQuantity, removeItem } = useCart();
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="max-w-page mx-auto px-6 md:px-10 py-16">
      <div className="text-center mb-14">
        <span className="eyebrow">Your Selection</span>
        <h1 className="font-display text-3xl md:text-4xl text-midnight mt-4">Shopping Bag</h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-voice italic text-lg text-midnight/60 mb-8">Your bag is currently empty.</p>
          <Link
            to="/shop"
            className="inline-block font-sans text-[12px] tracking-[0.2em] uppercase bg-midnight text-ivory px-8 py-4 hover:bg-midnight-deep"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-[1fr_360px] gap-14">
          <div className="divide-y divide-line border-t border-b border-line">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.color}`} className="flex gap-6 py-8">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-28 aspect-[4/5] object-cover bg-ivory-warm"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-base text-midnight">{item.product.name}</h3>
                    <p className="font-voice italic text-sm text-midnight/60">{item.color}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-line">
                      <button aria-label="Decrease quantity" onClick={() => updateQuantity(item.product.id, item.color, item.quantity - 1)} className="w-9 h-9 font-sans text-midnight/70 hover:text-gold">-</button>
                      <span className="w-9 text-center font-sans text-sm">{item.quantity}</span>
                      <button aria-label="Increase quantity" onClick={() => updateQuantity(item.product.id, item.color, item.quantity + 1)} className="w-9 h-9 font-sans text-midnight/70 hover:text-gold">+</button>
                    </div>
                    <p className="font-sans text-sm text-midnight">
                      {formatDZD(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
                <button onClick={() => removeItem(item.product.id, item.color)} className="font-sans text-[11px] tracking-wide uppercase text-midnight/40 hover:text-gold self-start">
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="bg-ivory-warm border border-line p-8 h-fit">
            <h2 className="font-display text-lg text-midnight mb-6">Order Summary</h2>
            <div className="flex justify-between font-sans text-sm text-midnight/70 mb-3">
              <span>Subtotal</span>
              <span>{formatDZD(subtotal)}</span>
            </div>
            <div className="flex justify-between font-sans text-sm text-midnight/70 mb-6">
              <span>Shipping</span>
              <span>{subtotal >= 5000 ? "Free" : "Calculated at checkout"}</span>
            </div>
            <div className="flex justify-between font-display text-base text-midnight border-t border-line pt-5">
              <span>Total</span>
              <span>{formatDZD(subtotal)}</span>
            </div>
            <Link
              to="/checkout"
              className="mt-8 block text-center font-sans text-[12px] tracking-[0.2em] uppercase bg-midnight text-ivory py-4 hover:bg-midnight-deep transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
