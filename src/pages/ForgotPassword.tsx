import { useState } from "react";
import { Link } from "react-router-dom";
import { useUserAuth } from "../contexts/UserAuthProvider";
import { AuthShell } from "./Login";

export default function ForgotPassword() {
  const { sendPasswordReset } = useUserAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(""); setError(""); setBusy(true);
    try { await sendPasswordReset(email.trim()); setMessage("Check your inbox for a password reset link."); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to send the reset email."); }
    finally { setBusy(false); }
  }

  return <AuthShell eyebrow="Reset" title="Forgot your password">
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && <p role="status" className="border border-green-900/20 bg-green-50 px-4 py-3 text-sm text-green-900">{message}</p>}
      {error && <p role="alert" className="border border-red-900/20 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p>}
      <label className="block text-sm">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" className="mt-2 w-full border border-line bg-transparent px-4 py-3 outline-none focus:border-gold" /></label>
      <button disabled={busy} className="w-full bg-midnight px-5 py-4 text-xs uppercase tracking-[0.2em] text-ivory disabled:opacity-60">{busy ? "Sending..." : "Send reset link"}</button>
    </form>
    <p className="mt-6 text-center text-sm text-midnight/60"><Link to="/login" className="text-midnight hover:text-gold">Back to sign in</Link></p>
  </AuthShell>;
}
