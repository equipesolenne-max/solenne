import { useState } from "react";
import { Link } from "react-router-dom";
import { submitContactForm } from "../api/account";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    setError("");

    try {
      await submitContactForm(form);
      setForm({ name: "", email: "", subject: "", message: "" });
      setStatus("Thank you for reaching out. A member of our team will respond shortly.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We were unable to process your request at this time.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-ivory">
      {/* Hero Header */}
      <section className="bg-midnight-deep text-ivory py-24 md:py-32 border-b border-gold/20">
        <div className="max-w-page mx-auto px-6 md:px-10 text-center">
          <span className="eyebrow text-gold mb-6 block">Assistance & Inquiries</span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl max-w-3xl mx-auto leading-tight">
            How may we help you?
          </h1>
          <p className="font-voice italic text-lg md:text-xl text-ivory/60 mt-8 max-w-xl mx-auto leading-relaxed">
            From bespoke styling advice to assistance with your recent order, our atelier is here to ensure your Solenne experience is seamless.
          </p>
        </div>
      </section>

      <div className="max-w-page mx-auto px-6 md:px-10 py-20 md:py-32 grid lg:grid-cols-2 gap-20">
        {/* Contact Form */}
        <section>
          <div className="mb-12">
            <h2 className="font-display text-2xl text-midnight mb-4">Send a Message</h2>
            <div className="w-12 h-px bg-gold" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {status && (
              <div role="status" className="p-4 bg-green-50 text-green-800 text-sm font-voice italic border border-green-100">
                {status}
              </div>
            )}
            {error && (
              <div role="alert" className="p-4 bg-red-50 text-red-900 text-sm font-voice italic border border-red-100">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              <div className="relative group">
                <label className="block text-[11px] uppercase tracking-widest text-midnight/50 mb-2 transition-colors group-focus-within:text-gold">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-transparent border-b border-line py-3 outline-none focus:border-gold transition-colors font-sans text-sm text-midnight"
                />
              </div>
              <div className="relative group">
                <label className="block text-[11px] uppercase tracking-widest text-midnight/50 mb-2 transition-colors group-focus-within:text-gold">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-transparent border-b border-line py-3 outline-none focus:border-gold transition-colors font-sans text-sm text-midnight"
                />
              </div>
            </div>

            <div className="relative group">
              <label className="block text-[11px] uppercase tracking-widest text-midnight/50 mb-2 transition-colors group-focus-within:text-gold">Subject</label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full bg-transparent border-b border-line py-3 outline-none focus:border-gold transition-colors font-sans text-sm text-midnight"
              />
            </div>

            <div className="relative group">
              <label className="block text-[11px] uppercase tracking-widest text-midnight/50 mb-2 transition-colors group-focus-within:text-gold">Message</label>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-transparent border-b border-line py-3 outline-none focus:border-gold transition-colors font-sans text-sm text-midnight resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-4 bg-midnight px-10 py-5 text-[11px] uppercase tracking-[0.25em] text-ivory hover:bg-midnight-deep transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {busy ? "Transmitting..." : "Send Inquiry"}
              <span className="text-gold group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </form>
        </section>

        {/* Contact Info & Help */}
        <aside className="space-y-16">
          <section>
            <h3 className="font-display text-lg text-midnight mb-6">Atelier Inquiries</h3>
            <div className="space-y-4 font-voice italic text-midnight/60 text-lg leading-relaxed">
              <p>For order-related questions, please include your order number.</p>
              <div className="pt-4 space-y-2 text-base not-italic font-sans tracking-wide">
                <a href="mailto:atelier@solenne.com" className="block hover:text-gold transition-colors">atelier@solenne.com</a>
                <p>+213 (0) 555 123 456</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-display text-lg text-midnight mb-6">Boutique Hours</h3>
            <div className="space-y-2 font-sans text-sm text-midnight/60 tracking-wider">
              <div className="flex justify-between border-b border-line/50 pb-2">
                <span>Monday – Friday</span>
                <span>09:00 – 18:00</span>
              </div>
              <div className="flex justify-between border-b border-line/50 pb-2">
                <span>Saturday</span>
                <span>10:00 – 16:00</span>
              </div>
              <div className="flex justify-between pb-2">
                <span>Sunday</span>
                <span>Closed</span>
              </div>
            </div>
          </section>

          <section className="bg-beige-soft/30 p-10 border border-line/50">
            <h3 className="font-display text-lg text-midnight mb-4 text-center italic">Frequently Asked</h3>
            <p className="text-sm font-sans text-midnight/60 text-center mb-8 leading-relaxed">
              Find immediate answers to common questions about shipping, returns, and silk care.
            </p>
            <div className="text-center">
              <Link
                to="/faq"
                className="text-[11px] uppercase tracking-widest text-midnight border-b border-gold pb-1 hover:text-gold transition-colors"
              >
                View FAQ →
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
