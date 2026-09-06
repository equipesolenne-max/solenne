import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserAuth } from "../contexts/UserAuthProvider";
import { AuthShell } from "./Login";

export default function Register() {
  const { register } = useUserAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    setError(""); setBusy(true);
    try { await register(form.name.trim(), form.email.trim(), form.password); navigate("/account", { replace: true }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to create your account."); }
    finally { setBusy(false); }
  }

  return <AuthShell eyebrow="Join us" title="Create your account">
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p role="alert" className="border border-red-900/20 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p>}
      <label className="block text-sm">Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required autoComplete="name" className="mt-2 w-full border border-line bg-transparent px-4 py-3 outline-none focus:border-gold" /></label>
      <label className="block text-sm">Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required autoComplete="email" className="mt-2 w-full border border-line bg-transparent px-4 py-3 outline-none focus:border-gold" /></label>
      <label className="block text-sm">Password<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={6} autoComplete="new-password" className="mt-2 w-full border border-line bg-transparent px-4 py-3 outline-none focus:border-gold" /></label>
      <label className="block text-sm">Confirm password<input type="password" value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} required minLength={6} autoComplete="new-password" className="mt-2 w-full border border-line bg-transparent px-4 py-3 outline-none focus:border-gold" /></label>
      <button disabled={busy} className="w-full bg-midnight px-5 py-4 text-xs uppercase tracking-[0.2em] text-ivory disabled:opacity-60">{busy ? "Creating..." : "Create account"}</button>
    </form>
    <p className="mt-6 text-center text-sm text-midnight/60">Already a member? <Link to="/login" className="text-midnight hover:text-gold">Sign in</Link></p>
  </AuthShell>;
}
