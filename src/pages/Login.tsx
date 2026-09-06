import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUserAuth } from "../contexts/UserAuthProvider";

function authMessage(error: unknown) {
  const code = error instanceof Error ? error.message : "Unable to sign in.";
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) return "The email or password is incorrect.";
  if (code.includes("too-many-requests")) return "Too many attempts. Please try again later.";
  return code;
}

export default function Login() {
  const { login } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const destination = (location.state as { from?: string } | null)?.from ?? "/account";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate(destination, { replace: true });
    } catch (reason) {
      setError(authMessage(reason));
    } finally {
      setBusy(false);
    }
  }

  return <AuthShell eyebrow="Welcome back" title="Sign in to Solenne">
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p role="alert" className="border border-red-900/20 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p>}
      <label className="block text-sm">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" className="mt-2 w-full border border-line bg-transparent px-4 py-3 outline-none focus:border-gold" /></label>
      <label className="block text-sm">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} autoComplete="current-password" className="mt-2 w-full border border-line bg-transparent px-4 py-3 outline-none focus:border-gold" /></label>
      <button disabled={busy} className="w-full bg-midnight px-5 py-4 text-xs uppercase tracking-[0.2em] text-ivory disabled:opacity-60">{busy ? "Signing in..." : "Sign in"}</button>
    </form>
    <div className="mt-6 flex justify-between text-sm text-midnight/60"><Link to="/forgot-password" className="hover:text-gold">Forgot password?</Link><Link to="/register" className="hover:text-gold">Create account</Link></div>
  </AuthShell>;
}

export function AuthShell({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <div className="mx-auto max-w-md px-6 py-20"><div className="mb-10 text-center"><span className="eyebrow">{eyebrow}</span><h1 className="mt-4 font-display text-3xl text-midnight">{title}</h1></div>{children}</div>;
}
